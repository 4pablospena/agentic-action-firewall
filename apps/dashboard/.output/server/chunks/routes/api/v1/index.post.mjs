import { d as defineEventHandler, r as requireSessionUser, b as readBody, c as createError, u as useDb, k as killSwitchEvents } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody(event);
  if (!body.scope || !body.reason) {
    throw createError({
      statusCode: 400,
      statusMessage: "scope and reason are required"
    });
  }
  const db = useDb();
  const [killEvent] = await db.insert(killSwitchEvents).values({
    workspaceId: user.workspaceId,
    scope: body.scope,
    reason: body.reason,
    activatedBy: user.id
  }).returning();
  return { event: killEvent };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
