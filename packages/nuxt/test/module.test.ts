import { describe, expect, it } from "vitest";
import module from "../src/module.js";

describe("@agent-firewall/nuxt module", () => {
  it("should expose module metadata", async () => {
    if (!module.getMeta) {
      throw new Error("module.getMeta is not defined");
    }
    const meta = await module.getMeta();
    expect(meta.name).toBe("@agent-firewall/nuxt");
    expect(meta.configKey).toBe("agentFirewall");
  });
});
