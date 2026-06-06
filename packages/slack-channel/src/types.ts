import type { ApprovalNeededEvent, ApprovalNeededResult } from "@agent-firewall/core";

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{
    type: string;
    text?: { type: string; text: string };
    action_id?: string;
    style?: string;
  }>;
}

export interface SlackApprovalConfig {
  botToken: string;
  channelId: string;
  /** Max wait for human response on R3/R4. Default: 300_000 (5 min). */
  approvalTimeoutMs?: number;
  /** Slack user IDs allowed to click "Approve (MFA verified)" for R4. */
  mfaApproverIds?: string[];
}

export interface SlackInteractionPayload {
  user: { id: string };
  actions: Array<{ action_id: string }>;
}

export interface SlackClient {
  postMessage(channelId: string, blocks: SlackBlock[]): Promise<void>;
}

export interface SlackApprovalChannel {
  onApprovalNeeded: (
    event: ApprovalNeededEvent,
  ) => Promise<ApprovalNeededResult | void>;
  handleInteraction: (payload: SlackInteractionPayload) => Promise<void>;
}

export interface PendingResolver {
  resolve: (result: ApprovalNeededResult | void) => void;
  riskTier: ApprovalNeededEvent["decision"]["riskTier"];
}

export const DEFAULT_APPROVAL_TIMEOUT_MS = 300_000;

export function actionIds(approvalId: string) {
  return {
    approve: `aaf:approve:${approvalId}`,
    deny: `aaf:deny:${approvalId}`,
    approveMfa: `aaf:approve-mfa:${approvalId}`,
  } as const;
}

export function parseActionId(actionId: string): { kind: "approve" | "deny" | "approve-mfa"; approvalId: string } | undefined {
  const match = /^aaf:(approve-mfa|approve|deny):(.+)$/.exec(actionId);
  if (!match) {
    return undefined;
  }
  return {
    kind: match[1] as "approve" | "deny" | "approve-mfa",
    approvalId: match[2]!,
  };
}
