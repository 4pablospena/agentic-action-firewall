import { d as defineEventHandler, r as requireSessionUser, b as readBody, i as ingestAuditEntry } from '../../../../nitro/nitro.mjs';
import 'drizzle-orm';
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

const entries_post = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody(event);
  const entry = await ingestAuditEntry(user.workspaceId, body);
  return { entry };
});

export { entries_post as default };
//# sourceMappingURL=entries.post.mjs.map
