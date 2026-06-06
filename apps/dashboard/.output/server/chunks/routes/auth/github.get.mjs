import { m as defineOAuthGitHubEventHandler, c as createError, h as ensureUserWorkspace, s as setUserSession, j as sendRedirect } from '../../nitro/nitro.mjs';
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
import 'node:module';

const github_get = defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true
  },
  async onSuccess(event, { user: githubUser }) {
    var _a;
    if (!githubUser.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "GitHub account must expose a verified email"
      });
    }
    const user = await ensureUserWorkspace({
      id: String(githubUser.id),
      email: githubUser.email,
      name: (_a = githubUser.name) != null ? _a : githubUser.login
    });
    await setUserSession(event, { user });
    return sendRedirect(event, "/audit");
  }
});

export { github_get as default };
//# sourceMappingURL=github.get.mjs.map
