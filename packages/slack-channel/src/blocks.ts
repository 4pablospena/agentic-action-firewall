import type { ApprovalNeededEvent } from "@agent-firewall/core";
import { actionIds, type SlackBlock } from "./types.js";

export function buildApprovalBlocks(
  event: ApprovalNeededEvent,
  options: { includeMfaButton: boolean; cancelWindowSeconds?: number },
): SlackBlock[] {
  const { call, decision, approvalId } = event;
  const ids = actionIds(approvalId);

  const lines = [
    `*AAF approval required*`,
    `Tool: \`${call.name}\``,
    `Risk tier: ${decision.riskTier}`,
    `Agent: \`${call.agentId}\``,
    `Session: \`${call.sessionId}\``,
    `Approval ID: \`${approvalId}\``,
    `Reason: ${decision.reason}`,
  ];

  if (decision.riskTier === "R2" && options.cancelWindowSeconds !== undefined) {
    lines.push(`Cancel window: ${options.cancelWindowSeconds}s`);
  }

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: { type: "mrkdwn", text: lines.join("\n") },
    },
  ];

  if (decision.riskTier === "R2") {
    return blocks;
  }

  const elements: NonNullable<SlackBlock["elements"]> = [];

  if (decision.riskTier === "R3") {
    elements.push(
      {
        type: "button",
        text: { type: "plain_text", text: "Approve" },
        action_id: ids.approve,
        style: "primary",
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Deny" },
        action_id: ids.deny,
        style: "danger",
      },
    );
  }

  if (decision.riskTier === "R4" && options.includeMfaButton) {
    elements.push(
      {
        type: "button",
        text: { type: "plain_text", text: "Approve (MFA verified)" },
        action_id: ids.approveMfa,
        style: "primary",
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Deny" },
        action_id: ids.deny,
        style: "danger",
      },
    );
  }

  if (elements.length > 0) {
    blocks.push({ type: "actions", elements });
  }

  return blocks;
}
