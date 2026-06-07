import { eq } from "drizzle-orm";

const ALLOWED_LABELS = new Set(["normal", "anomalous", "template"]);

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const baselineId = getRouterParam(event, "id");
  const body = await readBody<{
    labels?: Array<{ eventId: string; label: string }>;
  }>(event);

  if (!baselineId) {
    throw createError({ statusCode: 400, statusMessage: "baseline id is required" });
  }

  if (!body.labels || !Array.isArray(body.labels) || body.labels.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "labels array is required" });
  }

  const db = useDb();
  const [baselineRow] = await db
    .select()
    .from(schema.learningBaselines)
    .where(eq(schema.learningBaselines.id, baselineId))
    .limit(1);

  if (!baselineRow || baselineRow.workspaceId !== user.workspaceId) {
    throw createError({ statusCode: 404, statusMessage: "Learning baseline not found" });
  }

  const saved = [];
  for (const entry of body.labels) {
    if (!entry.eventId || !ALLOWED_LABELS.has(entry.label)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Each label requires eventId and label normal|anomalous|template",
      });
    }

    const [row] = await db
      .insert(schema.learningOutlierLabels)
      .values({
        baselineId,
        eventId: entry.eventId,
        label: entry.label,
        createdBy: user.id,
      })
      .onConflictDoUpdate({
        target: [schema.learningOutlierLabels.baselineId, schema.learningOutlierLabels.eventId],
        set: { label: entry.label, createdBy: user.id },
      })
      .returning();

    saved.push(row);
  }

  return { labels: saved };
});
