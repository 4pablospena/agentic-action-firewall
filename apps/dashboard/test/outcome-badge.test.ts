import { describe, expect, it } from "vitest";
import { outcomeBadgeVariant } from "../lib/outcome-badge";

describe("outcomeBadgeVariant", () => {
  it("maps canonical audit outcomes to badge variants", () => {
    expect(outcomeBadgeVariant("allow")).toBe("default");
    expect(outcomeBadgeVariant("block")).toBe("destructive");
    expect(outcomeBadgeVariant("throttle")).toBe("warning");
    expect(outcomeBadgeVariant("pending")).toBe("warning");
  });

  it("is case-insensitive", () => {
    expect(outcomeBadgeVariant("ALLOW")).toBe("default");
    expect(outcomeBadgeVariant("Block")).toBe("destructive");
  });

  it("returns outline for unknown outcomes", () => {
    expect(outcomeBadgeVariant("allowed")).toBe("outline");
    expect(outcomeBadgeVariant("unknown")).toBe("outline");
  });
});
