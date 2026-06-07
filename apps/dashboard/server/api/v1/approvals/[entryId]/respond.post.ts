import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const entryId = getRouterParam(event, "entryId");
  const body = await readBody<{ approved: boolean; mfaVerified?: boolean }>(event);

  if (!entryId) {
    throw createError({ statusCode: 400, statusMessage: "Missing entryId" });
  }

  if (typeof body.approved !== "boolean") {
    throw createError({ statusCode: 400, statusMessage: "approved is required" });
  }

  const db = useDb();
  const [row] = await db
    .select()
    .from(schema.auditEntries)
    .where(eq(schema.auditEntries.id, entryId))
    .limit(1);

  if (!row || row.workspaceId !== user.workspaceId) {
    throw createError({ statusCode: 404, statusMessage: "Audit entry not found" });
  }

  const [response] = await db
    .insert(schema.approvalResponses)
    .values({
      auditEntryId: row.id,
      approverId: user.id,
      approved: body.approved,
      mfaVerified: body.mfaVerified ?? false,
    })
    .returning();

  await notifyApprovalChannels({
    auditEntryId: row.id,
    approved: body.approved,
    approverId: user.id,
    workspaceId: user.workspaceId,
    entry: row.payload,
  });

  return { response };
});
