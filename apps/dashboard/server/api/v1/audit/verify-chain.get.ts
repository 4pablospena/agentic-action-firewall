import { asc, eq } from "drizzle-orm";
import { verifyAuditChainEntries } from "@agent-firewall/core";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();

  const [workspace] = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, user.workspaceId))
    .limit(1);

  const rows = await db
    .select()
    .from(schema.auditEntries)
    .where(eq(schema.auditEntries.workspaceId, user.workspaceId))
    .orderBy(asc(schema.auditEntries.ingestedAt));

  const entries = rows.map((row) => row.payload);

  if (entries.length === 0) {
    return { valid: true, entryCount: 0 };
  }

  if (!workspace?.signingPublicKey) {
    return {
      valid: null,
      entryCount: entries.length,
      message: "No signing public key configured for workspace",
    };
  }

  const result = await verifyAuditChainEntries(
    entries,
    hexToBytes(workspace.signingPublicKey),
  );

  return {
    ...result,
    entryCount: entries.length,
  };
});
