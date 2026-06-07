import { d as defineEventHandler, r as requireSessionUser, u as useDb, e as auditEntries } from '../../../../nitro/nitro.mjs';
import { eq, desc } from 'drizzle-orm';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'ajv/dist/2020.js';
import 'ajv-formats';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';

const pending_get = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();
  const rows = await db.select().from(auditEntries).where(eq(auditEntries.workspaceId, user.workspaceId)).orderBy(desc(auditEntries.ingestedAt));
  return {
    pending: rows.filter((row) => row.payload.decision.outcome === "pending").map((row) => ({
      id: row.id,
      entry: row.payload
    }))
  };
});

export { pending_get as default };
//# sourceMappingURL=pending.get.mjs.map
