import type { AuditEntry } from "@agent-firewall/core";
import { buildApprovalBlocks } from "@agent-firewall/slack-channel";

export async function notifyPendingApproval(entry: AuditEntry, options: {
  slackWebhookUrl?: string;
  slackBotToken?: string;
  slackChannelId?: string;
  resendApiKey?: string;
  notificationEmail?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  notificationPhone?: string;
}): Promise<void> {
  const summary = `Pending approval: ${entry.tool_call.name} (${entry.tool_call.risk_class})`;

  if (options.slackBotToken && options.slackChannelId) {
    const blocks = buildApprovalBlocks(
      {
        call: {
          name: entry.tool_call.name,
          arguments: entry.tool_call.arguments as Record<string, unknown>,
          agentId: entry.agent_id,
          sessionId: entry.session_id,
          timestamp: entry.timestamp,
        },
        decision: {
          outcome: entry.decision.outcome,
          byLayer: entry.decision.by_layer,
          reason: entry.decision.reason,
          riskTier: entry.tool_call.risk_class,
        },
        auditEntry: entry,
        approvalId: entry.id,
      },
      { includeMfaButton: entry.tool_call.risk_class === "R4" },
    );

    await $fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.slackBotToken}`,
        "Content-Type": "application/json",
      },
      body: {
        channel: options.slackChannelId,
        text: summary,
        blocks,
      },
    });
  } else if (options.slackWebhookUrl) {
    await $fetch(options.slackWebhookUrl, {
      method: "POST",
      body: { text: summary },
    });
  }

  if (options.resendApiKey && options.notificationEmail) {
    await sendResendEmail({
      apiKey: options.resendApiKey,
      to: options.notificationEmail,
      subject: summary,
      html: `<p>${entry.decision.reason}</p><p>Agent: ${entry.agent_id}</p>`,
    });
  }

  if (options.twilioAccountSid && options.twilioAuthToken && options.notificationPhone) {
    await sendTwilioSms({
      accountSid: options.twilioAccountSid,
      authToken: options.twilioAuthToken,
      to: options.notificationPhone,
      body: summary,
    });
  }
}
