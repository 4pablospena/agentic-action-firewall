import { d as defineEventHandler, r as requireSessionUser, u as useDb, k as killSwitchEvents } from '../../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';
import 'node:module';

const index_get = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();
  const events = await db.select().from(killSwitchEvents).where(eq(killSwitchEvents.workspaceId, user.workspaceId)).orderBy(desc(killSwitchEvents.createdAt)).limit(20);
  return { events };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
