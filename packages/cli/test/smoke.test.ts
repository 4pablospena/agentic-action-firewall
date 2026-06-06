import { describe, expect, it } from "vitest";
import { VERSION } from "@agent-firewall/core";

describe("@agent-firewall/cli", () => {
  it("should depend on core VERSION", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
