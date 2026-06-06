import { desc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();

  const rows = await db
    .select()
    .from(schema.auditEntries)
    .where(eq(schema.auditEntries.workspaceId, user.workspaceId))
    .orderBy(desc(schema.auditEntries.ingestedAt));

  return {
    pending: rows
      .filter((row) => row.payload.decision.outcome === "pending")
      .map((row) => ({
        id: row.id,
        entry: row.payload,
      })),
  };
});
