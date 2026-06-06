import yaml from "js-yaml";
import { validatePolicy } from "@agent-firewall/schemas";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody<{ yaml: string }>(event);

  if (!body.yaml || typeof body.yaml !== "string") {
    throw createError({ statusCode: 400, statusMessage: "yaml is required" });
  }

  let document: unknown;
  try {
    document = yaml.load(body.yaml);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid YAML" });
  }

  const result = validatePolicy(document);
  if (!result.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Policy validation failed",
      data: result.errors,
    });
  }

  const policy = result.data as { version?: string };
  const db = useDb();
  const [row] = await db
    .insert(schema.policies)
    .values({
      workspaceId: user.workspaceId,
      yaml: body.yaml,
      version: policy.version,
    })
    .returning();

  return { policy: row };
});
