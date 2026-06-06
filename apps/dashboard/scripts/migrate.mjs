import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { loadDashboardEnv } from "./load-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "../server/database/migrations/0000_init.sql");

loadDashboardEnv();

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is required. Set it in apps/dashboard/.env");
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
const migration = readFileSync(sqlPath, "utf8");

await sql.unsafe(migration);
await sql.end();
console.log("Migration applied:", sqlPath);
