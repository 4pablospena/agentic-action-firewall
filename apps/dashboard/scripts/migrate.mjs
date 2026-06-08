import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { loadDashboardEnv } from "./load-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "../server/database/migrations");
const MIGRATION_LOCK_KEY = 8_847_291n;

loadDashboardEnv();

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is required. Set it in apps/dashboard/.env");
  process.exit(1);
}

async function connectWithRetry(maxAttempts = 30, delayMs = 1_000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const sql = postgres(url, { max: 1, onnotice: () => {} });
      await sql`SELECT 1`;
      return sql;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError ?? new Error("Failed to connect to Postgres");
}

const sql = await connectWithRetry();

try {
  await sql`SELECT pg_advisory_lock(${MIGRATION_LOCK_KEY})`;

  await sql`
    CREATE TABLE IF NOT EXISTS "_aaf_migrations" (
      "name" text PRIMARY KEY,
      "applied_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  const appliedRows = await sql`SELECT name FROM "_aaf_migrations"`;
  const applied = new Set(appliedRows.map((row) => row.name));

  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const migration = readFileSync(join(migrationsDir, file), "utf8");

    await sql.begin(async (tx) => {
      await tx.unsafe(migration);
      await tx`INSERT INTO "_aaf_migrations" (name) VALUES (${file})`;
    });

    console.log("Migration applied:", file);
  }
} finally {
  await sql`SELECT pg_advisory_unlock(${MIGRATION_LOCK_KEY})`.catch(() => {});
  await sql.end();
}
