interface ApprovalWebhookPayload {
  auditEntryId: string;
  approved: boolean;
  approverId: string;
  workspaceId: string;
  entry: unknown;
}

export async function dispatchApprovalWebhook(payload: ApprovalWebhookPayload): Promise<void> {
  const config = useRuntimeConfig();
  const url = config.approvalWebhookUrl;
  if (!url) {
    return;
  }

  try {
    await $fetch(url, {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    console.error("[dashboard] approval webhook dispatch failed:", error);
  }
}

export async function notifyApprovalChannels(payload: ApprovalWebhookPayload): Promise<void> {
  await dispatchApprovalWebhook(payload);

  const config = useRuntimeConfig();
  const entry = payload.entry as {
    tool_call?: { name?: string; risk_class?: string };
    decision?: { reason?: string };
    agent_id?: string;
  };

  const summary = `Approval ${payload.approved ? "granted" : "denied"} for ${entry.tool_call?.name ?? "action"}`;

  if (config.resendApiKey && config.notificationEmail) {
    try {
      await sendResendEmail({
        apiKey: config.resendApiKey,
        to: config.notificationEmail,
        subject: summary,
        html: `<p>${entry.decision?.reason ?? ""}</p>`,
      });
    } catch (error) {
      console.error("[dashboard] Resend notification failed:", error);
    }
  }

  if (config.twilioAccountSid && config.twilioAuthToken && config.notificationPhone) {
    try {
      await sendTwilioSms({
        accountSid: config.twilioAccountSid,
        authToken: config.twilioAuthToken,
        to: config.notificationPhone,
        body: summary,
      });
    } catch (error) {
      console.error("[dashboard] Twilio notification failed:", error);
    }
  }

  if (config.slackWebhookUrl) {
    try {
      await $fetch(config.slackWebhookUrl, {
        method: "POST",
        body: {
          text: `${summary} · audit entry ${payload.auditEntryId}`,
        },
      });
    } catch (error) {
      console.error("[dashboard] Slack notification failed:", error);
    }
  }
}
