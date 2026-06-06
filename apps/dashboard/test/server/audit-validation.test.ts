import { describe, expect, it } from "vitest";
import { validateAuditEntry } from "@agent-firewall/schemas/audit";
import auditFixture from "../../../../schemas/fixtures/audit-entry.example.json";

describe("validateAuditEntry", () => {
  it("should accept the canonical audit fixture", () => {
    const result = validateAuditEntry(auditFixture);
    expect(result.valid).toBe(true);
  });

  it("should reject invalid audit entries", () => {
    const result = validateAuditEntry({ id: "bad" });
    expect(result.valid).toBe(false);
  });
});
