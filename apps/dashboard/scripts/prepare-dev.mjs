import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDashboardEnv } from "./load-env.mjs";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(appRoot, "../..");

function ensureWorkspaceDepsBuilt() {
  const coreDist = join(repoRoot, "packages/core/dist/index.js");
  const nuxtDist = join(repoRoot, "packages/nuxt/dist/module.mjs");
  if (existsSync(coreDist) && existsSync(nuxtDist)) {
    return;
  }

  console.log("Building workspace dependencies for dashboard dev...");
  const build = spawnSync(
    "pnpm",
    ["--filter", "...@agent-firewall/dashboard", "build"],
    { cwd: repoRoot, stdio: "inherit", env: process.env },
  );
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

loadDashboardEnv();
ensureWorkspaceDepsBuilt();

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

const migrate = spawnSync(process.execPath, ["scripts/migrate.mjs"], {
  cwd: appRoot,
  stdio: "inherit",
  env: process.env,
});

if (migrate.status !== 0) {
  process.exit(migrate.status ?? 1);
}

const autoSeed = process.env.NUXT_AUTO_SEED !== "false";
if (autoSeed && devBypass) {
  const seed = spawnSync(process.execPath, ["scripts/seed-demo.mjs"], {
    cwd: appRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (seed.status !== 0) {
    process.exit(seed.status ?? 1);
  }
} else if (devBypass) {
  console.log("Auto-seed disabled (NUXT_AUTO_SEED=false). Run pnpm db:seed manually.");
} else {
  console.log("Run pnpm db:seed to load demo audit data");
}

const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
if (major >= 24) {
  console.warn(
    "Node 24+ detected. This repo targets Node 22 LTS; use `nvm use` if you hit dev-server issues.",
  );
}
