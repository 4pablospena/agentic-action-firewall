import { validateAuditEntry } from "@agent-firewall/schemas/audit";
import type { AuditEntry } from "@agent-firewall/core";
import { schema, useDb } from "../database";

export async function ingestAuditEntry(
  workspaceId: string,
  body: unknown,
): Promise<AuditEntry> {
  const result = validateAuditEntry(body);
  if (!result.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid audit entry",
      data: result.errors,
    });
  }

  const entry = result.data as AuditEntry;
  const db = useDb();

  await db.insert(schema.auditEntries).values({
    workspaceId,
    entryId: entry.id,
    payload: entry,
  });

  if (entry.decision.outcome === "pending") {
    const config = useRuntimeConfig();
    await notifyPendingApproval(entry, {
      slackWebhookUrl: config.slackWebhookUrl,
      slackBotToken: config.slackBotToken,
      slackChannelId: config.slackApprovalChannelId,
      resendApiKey: config.resendApiKey,
      notificationEmail: config.notificationEmail,
      twilioAccountSid: config.twilioAccountSid,
      twilioAuthToken: config.twilioAuthToken,
      notificationPhone: config.notificationPhone,
    }).catch((error) => {
      console.error("[dashboard] pending approval notification failed:", error);
    });
  }

  return entry;
}
