import { desc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();

  const events = await db
    .select()
    .from(schema.killSwitchEvents)
    .where(eq(schema.killSwitchEvents.workspaceId, user.workspaceId))
    .orderBy(desc(schema.killSwitchEvents.createdAt))
    .limit(20);

  return { events };
});
