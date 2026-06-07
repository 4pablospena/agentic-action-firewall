import yaml from "js-yaml";
import { desc, eq } from "drizzle-orm";
import { validatePolicy } from "@agent-firewall/schemas";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const baselineId = getRouterParam(event, "id");
  const body = await readBody<{
    approvedTools?: Record<string, boolean>;
    thresholdOverrides?: Record<string, { perHour?: number; minIntervalSeconds?: number }>;
  }>(event);

  if (!baselineId) {
    throw createError({ statusCode: 400, statusMessage: "baseline id is required" });
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

  const approvedTools = body.approvedTools ?? Object.fromEntries(
    Object.keys(baselineRow.baseline.tools).map((tool) => [tool, true]),
  );

  const [currentPolicy] = await db
    .select()
    .from(schema.policies)
    .where(eq(schema.policies.workspaceId, user.workspaceId))
    .orderBy(desc(schema.policies.validatedAt))
    .limit(1);

  const mergedYaml = buildApprovedPolicyYaml(
    currentPolicy?.yaml,
    baselineRow.baseline,
    approvedTools,
    body.thresholdOverrides ?? {},
  );

  let document: unknown;
  try {
    document = yaml.load(mergedYaml);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Generated policy YAML is invalid" });
  }

  const result = validatePolicy(document);
  if (!result.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Generated policy validation failed",
      data: result.errors,
    });
  }

  const policy = result.data as { version?: string };
  const [policyRow] = await db
    .insert(schema.policies)
    .values({
      workspaceId: user.workspaceId,
      yaml: mergedYaml,
      version: policy.version,
    })
    .returning();

  const [updatedBaseline] = await db
    .update(schema.learningBaselines)
    .set({ status: "approved" })
    .where(eq(schema.learningBaselines.id, baselineId))
    .returning();

  return {
    baseline: updatedBaseline,
    policy: policyRow,
  };
});
