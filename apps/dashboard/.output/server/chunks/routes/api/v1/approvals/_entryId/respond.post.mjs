import { d as defineEventHandler, r as requireSessionUser, g as getRouterParam, b as readBody, c as createError, u as useDb, e as auditEntries, f as approvalResponses } from '../../../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';
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

const respond_post = defineEventHandler(async (event) => {
  var _a;
  const user = await requireSessionUser(event);
  const entryId = getRouterParam(event, "entryId");
  const body = await readBody(event);
  if (!entryId) {
    throw createError({ statusCode: 400, statusMessage: "Missing entryId" });
  }
  if (typeof body.approved !== "boolean") {
    throw createError({ statusCode: 400, statusMessage: "approved is required" });
  }
  const db = useDb();
  const [row] = await db.select().from(auditEntries).where(eq(auditEntries.id, entryId)).limit(1);
  if (!row || row.workspaceId !== user.workspaceId) {
    throw createError({ statusCode: 404, statusMessage: "Audit entry not found" });
  }
  const [response] = await db.insert(approvalResponses).values({
    auditEntryId: row.id,
    approverId: user.id,
    approved: body.approved,
    mfaVerified: (_a = body.mfaVerified) != null ? _a : false
  }).returning();
  return { response };
});

export { respond_post as default };
//# sourceMappingURL=respond.post.mjs.map
