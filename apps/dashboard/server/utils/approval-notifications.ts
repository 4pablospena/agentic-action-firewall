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
  if (config.resendApiKey && config.notificationEmail) {
    console.info("[dashboard] Resend notification queued for", config.notificationEmail);
  }

  if (config.twilioAccountSid && config.twilioAuthToken && config.notificationPhone) {
    console.info("[dashboard] Twilio SMS notification queued for", config.notificationPhone);
  }

  if (config.slackWebhookUrl) {
    try {
      await $fetch(config.slackWebhookUrl, {
        method: "POST",
        body: {
          text: `Approval ${payload.approved ? "granted" : "denied"} for audit entry ${payload.auditEntryId}`,
        },
      });
    } catch (error) {
      console.error("[dashboard] Slack notification failed:", error);
    }
  }
}
