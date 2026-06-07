import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { loadDashboardEnv } from "./load-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "../server/database/migrations");

loadDashboardEnv();

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is required. Set it in apps/dashboard/.env");
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

for (const file of files) {
  const migration = readFileSync(join(migrationsDir, file), "utf8");
  await sql.unsafe(migration);
  console.log("Migration applied:", file);
}

await sql.end();
