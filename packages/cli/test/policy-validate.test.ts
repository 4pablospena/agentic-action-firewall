import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runPolicyValidate } from "../src/commands/policy-validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const enforcementPolicy = join(
  __dirname,
  "..",
  "..",
  "core",
  "test",
  "fixtures",
  "enforcement-policy.yml",
);
const invalidPolicy = join(
  __dirname,
  "..",
  "..",
  "core",
  "test",
  "fixtures",
  "invalid-policy.yml",
);

describe("aaf policy validate", () => {
  it("should exit 0 for a valid policy file", () => {
    const code = runPolicyValidate(enforcementPolicy);

    expect(code).toBe(0);
  });

  it("should exit 1 for an invalid policy file", () => {
    const code = runPolicyValidate(invalidPolicy);

    expect(code).toBe(1);
  });

  it("should exit 2 when path argument is missing", () => {
    const code = runPolicyValidate(undefined);

    expect(code).toBe(2);
  });
});
