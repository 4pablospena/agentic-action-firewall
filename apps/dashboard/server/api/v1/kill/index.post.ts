export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody<{ scope: string; reason: string }>(event);

  if (!body.scope || !body.reason) {
    throw createError({
      statusCode: 400,
      statusMessage: "scope and reason are required",
    });
  }

  const db = useDb();
  const [killEvent] = await db
    .insert(schema.killSwitchEvents)
    .values({
      workspaceId: user.workspaceId,
      scope: body.scope,
      reason: body.reason,
      activatedBy: user.id,
    })
    .returning();

  await syncKillSwitchToControlPlane(body.scope, body.reason);

  return { event: killEvent };
});
