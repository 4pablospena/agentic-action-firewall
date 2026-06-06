import type { FirewallDecision } from "./types.js";

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`Not implemented: ${feature} (Paso 3b)`);
    this.name = "NotImplementedError";
  }
}

export class FirewallInternalError extends Error {
  constructor(
    public readonly layer: 1 | 2 | 3 | 4 | 5,
    message: string,
  ) {
    super(`[Layer ${layer}] ${message}`);
    this.name = "FirewallInternalError";
  }
}

export class FirewallBlockedError extends Error {
  constructor(public readonly decision: FirewallDecision) {
    super(decision.reason);
    this.name = "FirewallBlockedError";
  }
}
