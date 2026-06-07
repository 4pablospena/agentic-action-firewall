import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDashboardEnv } from "./load-env.mjs";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

loadDashboardEnv();

const sessionPassword = process.env.NUXT_SESSION_PASSWORD ?? "";
if (sessionPassword.length < 32) {
  console.warn(
    "NUXT_SESSION_PASSWORD must be at least 32 characters in apps/dashboard/.env",
  );
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing from apps/dashboard/.env");
  process.exit(1);
}

console.log("Dashboard env loaded from apps/dashboard/.env");

const hasOAuth = Boolean(
  process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
  && process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
);
const devBypass = process.env.NUXT_DEV_AUTH_BYPASS === "true";

if (!hasOAuth && !devBypass) {
  console.warn(
    "GitHub OAuth is not configured. Set NUXT_OAUTH_GITHUB_CLIENT_ID/SECRET or NUXT_DEV_AUTH_BYPASS=true in apps/dashboard/.env",
  );
} else if (!hasOAuth && devBypass) {
  console.log("Dev auth bypass enabled — use “Continue as Dev User” on /login");
}

console.log("Run pnpm db:seed to load demo audit data");

const migrate = spawnSync(process.execPath, ["scripts/migrate.mjs"], {
  cwd: appRoot,
  stdio: "inherit",
  env: process.env,
});

if (migrate.status !== 0) {
  process.exit(migrate.status ?? 1);
}

const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
if (major >= 24) {
  console.warn(
    "Node 24+ detected. This repo targets Node 22 LTS; use `nvm use` if you hit dev-server issues.",
  );
}
