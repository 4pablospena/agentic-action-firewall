import { describe, expect, it } from "vitest";
import { VERSION } from "../src/index.js";

describe("@agent-firewall/core", () => {
  it("should export VERSION", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
