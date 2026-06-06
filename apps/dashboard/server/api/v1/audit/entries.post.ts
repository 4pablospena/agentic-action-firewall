export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody(event);
  const entry = await ingestAuditEntry(user.workspaceId, body);
  return { entry };
});
