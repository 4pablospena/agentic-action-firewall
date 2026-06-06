import type {
  ApprovalNeededEvent,
  ApprovalNeededResult,
} from "@agent-firewall/core";
import { buildApprovalBlocks } from "./blocks.js";
import {
  DEFAULT_APPROVAL_TIMEOUT_MS,
  parseActionId,
  type PendingResolver,
  type SlackApprovalChannel,
  type SlackApprovalConfig,
  type SlackClient,
  type SlackInteractionPayload,
} from "./types.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createSlackApprovalChannel(
  config: SlackApprovalConfig,
  client: SlackClient,
): SlackApprovalChannel {
  const pending = new Map<string, PendingResolver>();
  const approvalTimeoutMs = config.approvalTimeoutMs ?? DEFAULT_APPROVAL_TIMEOUT_MS;
  const mfaApproverIds = new Set(config.mfaApproverIds ?? []);

  function clearPending(approvalId: string): void {
    pending.delete(approvalId);
  }

  async function waitForHumanResponse(
    event: ApprovalNeededEvent,
  ): Promise<ApprovalNeededResult | void> {
    const { approvalId, decision } = event;

    return new Promise<ApprovalNeededResult | void>((resolve) => {
      pending.set(approvalId, { resolve, riskTier: decision.riskTier });

      void (async () => {
        await sleep(approvalTimeoutMs);
        const entry = pending.get(approvalId);
        if (entry?.resolve === resolve) {
          clearPending(approvalId);
          resolve(undefined);
        }
      })();
    });
  }

  return {
    async onApprovalNeeded(event: ApprovalNeededEvent): Promise<ApprovalNeededResult | void> {
      const { decision } = event;
      const blocks = buildApprovalBlocks(event, {
        includeMfaButton: decision.riskTier === "R4",
        ...(decision.riskTier === "R2" ? { cancelWindowSeconds: 30 } : {}),
      });

      await client.postMessage(config.channelId, blocks);

      if (decision.riskTier === "R2") {
        return undefined;
      }

      if (decision.riskTier === "R3" || decision.riskTier === "R4") {
        return waitForHumanResponse(event);
      }

      return undefined;
    },

    async handleInteraction(payload: SlackInteractionPayload): Promise<void> {
      const action = payload.actions[0];
      if (!action) {
        return;
      }

      const parsed = parseActionId(action.action_id);
      if (!parsed) {
        return;
      }

      const entry = pending.get(parsed.approvalId);
      if (!entry) {
        return;
      }

      if (parsed.kind === "deny") {
        clearPending(parsed.approvalId);
        entry.resolve({ approved: false, reason: "denied via Slack" });
        return;
      }

      if (parsed.kind === "approve") {
        if (entry.riskTier !== "R3") {
          return;
        }
        clearPending(parsed.approvalId);
        entry.resolve({
          approved: true,
          approver: payload.user.id,
        });
        return;
      }

      if (parsed.kind === "approve-mfa") {
        if (entry.riskTier !== "R4") {
          return;
        }
        if (!mfaApproverIds.has(payload.user.id)) {
          return;
        }
        clearPending(parsed.approvalId);
        entry.resolve({
          approved: true,
          approver: payload.user.id,
          mfaVerified: true,
        });
      }
    },
  };
}
