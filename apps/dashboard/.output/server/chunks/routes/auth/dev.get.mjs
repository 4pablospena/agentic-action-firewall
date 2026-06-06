import { d as defineEventHandler, c as createError, h as ensureUserWorkspace, s as setUserSession, j as sendRedirect, l as useRuntimeConfig } from '../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';

const dev_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (!config.devAuthBypass) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  const user = await ensureUserWorkspace({
    email: "dev@localhost",
    name: "Dev User"
  });
  await setUserSession(event, { user });
  return sendRedirect(event, "/audit");
});

export { dev_get as default };
//# sourceMappingURL=dev.get.mjs.map
