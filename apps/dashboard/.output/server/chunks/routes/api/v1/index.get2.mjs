import { d as defineEventHandler, r as requireSessionUser, u as useDb, p as policies } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();
  const rows = await db.select().from(policies).where(eq(policies.workspaceId, user.workspaceId)).orderBy(desc(policies.validatedAt));
  return { policies: rows };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
