import { desc, eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const agentId = getRouterParam(event, "agentId");

  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: "agentId is required" });
  }

  const db = useDb();
  const [baselineRow] = await db
    .select()
    .from(schema.learningBaselines)
    .where(
      and(
        eq(schema.learningBaselines.workspaceId, user.workspaceId),
        eq(schema.learningBaselines.agentId, agentId),
      ),
    )
    .orderBy(desc(schema.learningBaselines.uploadedAt))
    .limit(1);

  if (!baselineRow) {
    throw createError({ statusCode: 404, statusMessage: "Learning baseline not found" });
  }

  const outliers = baselineRow.events
    ? rankObservationOutliers(baselineRow.events)
    : [];

  return {
    baseline: baselineRow,
    narrative: buildLearningNarrative(baselineRow.baseline),
    outliers,
  };
});
