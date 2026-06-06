import type { KillSwitchScope, ToolCall } from "../types.js";

export class KillSwitch {
  private readonly activeScopes = new Map<KillSwitchScope, string>();

  activate(scope: KillSwitchScope, reason: string): void {
    this.activeScopes.set(scope, reason);
  }

  isActive(scope: KillSwitchScope): boolean {
    return this.activeScopes.has(scope);
  }

  getReason(scope: KillSwitchScope): string | undefined {
    return this.activeScopes.get(scope);
  }

  isKilled(call: ToolCall): { killed: boolean; reason: string } {
    if (this.activeScopes.has("all")) {
      return {
        killed: true,
        reason: this.activeScopes.get("all") ?? "Kill switch activated",
      };
    }
    const agentScope = `agent:${call.agentId}` as KillSwitchScope;
    if (this.activeScopes.has(agentScope)) {
      return {
        killed: true,
        reason: this.activeScopes.get(agentScope) ?? "Agent stopped",
      };
    }
    const sessionScope = `session:${call.sessionId}` as KillSwitchScope;
    if (this.activeScopes.has(sessionScope)) {
      return {
        killed: true,
        reason: this.activeScopes.get(sessionScope) ?? "Session stopped",
      };
    }
    return { killed: false, reason: "" };
  }
}
