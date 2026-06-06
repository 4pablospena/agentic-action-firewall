import { and, desc, eq, sql } from "drizzle-orm";
import { schema, useDb } from "../database";
import { requireSessionUser } from "./auth";

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();
  const query = getQuery(event);

  const limit = Math.min(Number(query.limit ?? 50), 200);
  const offset = Number(query.offset ?? 0);

  const conditions = [eq(schema.auditEntries.workspaceId, user.workspaceId)];

  if (typeof query.agent_id === "string" && query.agent_id.length > 0) {
    conditions.push(
      sql`${schema.auditEntries.payload}->>'agent_id' = ${query.agent_id}`,
    );
  }

  if (typeof query.outcome === "string" && query.outcome.length > 0) {
    conditions.push(
      sql`${schema.auditEntries.payload}->'decision'->>'outcome' = ${query.outcome}`,
    );
  }

  const rows = await db
    .select()
    .from(schema.auditEntries)
    .where(and(...conditions))
    .orderBy(desc(schema.auditEntries.ingestedAt))
    .limit(limit)
    .offset(offset);

  return {
    entries: rows.map((row) => row.payload),
    pagination: { limit, offset, count: rows.length },
  };
});
