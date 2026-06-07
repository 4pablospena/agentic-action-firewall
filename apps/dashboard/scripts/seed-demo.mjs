import postgres from "postgres";
import { loadDashboardEnv } from "./load-env.mjs";
import { buildDemoAuditChain, DEMO_ENTRY_ID_PREFIX } from "./demo-audit.mjs";

const DEV_EMAIL = "dev@localhost";
const DEV_NAME = "Dev User";
const force = process.argv.includes("--force");

loadDashboardEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required. Set it in apps/dashboard/.env");
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

try {
  let [user] = await sql`
    SELECT id, email, name FROM users WHERE email = ${DEV_EMAIL} LIMIT 1
  `;

  if (!user) {
    [user] = await sql`
      INSERT INTO users (email, name, oauth_provider)
      VALUES (${DEV_EMAIL}, ${DEV_NAME}, 'github')
      RETURNING id, email, name
    `;

    const [workspace] = await sql`
      INSERT INTO workspaces (name, owner_id)
      VALUES (${`${DEV_NAME}'s workspace`}, ${user.id})
      RETURNING id
    `;

    await sql`
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES (${workspace.id}, ${user.id}, 'owner')
    `;

    console.log("Created dev user and workspace for", DEV_EMAIL);
  }

  const [membership] = await sql`
    SELECT workspace_id FROM workspace_members WHERE user_id = ${user.id} LIMIT 1
  `;

  if (!membership) {
    console.error("Dev user exists but has no workspace membership");
    process.exit(1);
  }

  const workspaceId = membership.workspace_id;

  const [existing] = await sql`
    SELECT count(*)::int AS count FROM audit_entries
    WHERE workspace_id = ${workspaceId}
      AND entry_id LIKE ${`${DEMO_ENTRY_ID_PREFIX}%`}
  `;

  if (existing.count > 0 && !force) {
    console.log("Demo audit entries already exist — use --force to reseed");
    process.exit(0);
  }

  if (force && existing.count > 0) {
    await sql`
      DELETE FROM audit_entries
      WHERE workspace_id = ${workspaceId}
        AND entry_id LIKE ${`${DEMO_ENTRY_ID_PREFIX}%`}
    `;
    console.log("Removed existing demo audit entries");
  }

  const { publicKeyHex, entries } = await buildDemoAuditChain();

  await sql`
    UPDATE workspaces
    SET signing_public_key = ${publicKeyHex}
    WHERE id = ${workspaceId}
  `;

  for (const entry of entries) {
    await sql`
      INSERT INTO audit_entries (workspace_id, entry_id, payload)
      VALUES (${workspaceId}, ${entry.id}, ${sql.json(entry)})
    `;
  }

  console.log(`Seeded ${entries.length} demo audit entries for workspace ${workspaceId}`);
} finally {
  await sql.end();
}
