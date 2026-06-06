import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Firewall } from "../src/firewall.js";
import {
  loadPolicyFromPath,
  loadPolicyFromYaml,
  PolicyValidationError,
} from "../src/policy/load.js";
import { makeReadInbox } from "./helpers/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const enforcementPath = join(__dirname, "fixtures", "enforcement-policy.yml");
const invalidPath = join(__dirname, "fixtures", "invalid-policy.yml");

describe("Policy loader", () => {
  it("should load a valid enforcement policy from path", () => {
    const policy = loadPolicyFromPath(enforcementPath);

    expect(policy.version).toBe("1");
    expect(policy.tools?.["gmail.read"]?.risk).toBe("R1");
  });

  it("should throw PolicyValidationError for invalid policy YAML", () => {
    expect(() => loadPolicyFromPath(invalidPath)).toThrow(PolicyValidationError);
  });

  it("should throw PolicyValidationError with schema path details", () => {
    try {
      loadPolicyFromYaml("tools: {}\n", "inline-policy");
      expect.unreachable("expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(PolicyValidationError);
      const validationError = error as PolicyValidationError;
      expect(validationError.errors.length).toBeGreaterThan(0);
    }
  });

  it("should construct Firewall from a validated policy path", async () => {
    const firewall = new Firewall({ policies: enforcementPath });
    const decision = await firewall.evaluate(makeReadInbox());

    expect(decision.outcome).toBe("allow");
    expect(decision.riskTier).toBe("R1");
    expect(decision.byLayer).toBe(1);
  });
});
