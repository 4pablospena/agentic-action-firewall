import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody(event);
  const { agentId, baseline, events } = parseLearningUpload(body);

  const db = useDb();
  const [row] = await db
    .insert(schema.learningBaselines)
    .values({
      workspaceId: user.workspaceId,
      agentId,
      baseline,
      events: events ?? null,
      status: "pending_review",
    })
    .returning();

  return { baseline: row };
});
