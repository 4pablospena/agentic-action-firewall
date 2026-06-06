import { desc, eq } from "drizzle-orm";
import { validatePolicy } from "@agent-firewall/schemas";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();

  const rows = await db
    .select()
    .from(schema.policies)
    .where(eq(schema.policies.workspaceId, user.workspaceId))
    .orderBy(desc(schema.policies.validatedAt));

  return { policies: rows };
});
