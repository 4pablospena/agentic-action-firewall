import type { KillSwitchScope, ToolCall } from "../types.js";

export interface RemoteKillSwitchClient {
  check(call: ToolCall): Promise<{ killed: boolean; reason: string; scope?: string }>;
}

export class HttpKillSwitchClient implements RemoteKillSwitchClient {
  constructor(private readonly baseUrl: string) {}

  async check(call: ToolCall): Promise<{ killed: boolean; reason: string; scope?: string }> {
    const url = new URL("/kill/check", this.baseUrl);
    url.searchParams.set("agentId", call.agentId);
    url.searchParams.set("sessionId", call.sessionId);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { killed: false, reason: "" };
      }

      const body = await response.json() as { killed?: boolean; reason?: string; scope?: string };
      return {
        killed: body.killed === true,
        reason: body.reason ?? "",
        ...(body.scope ? { scope: body.scope } : {}),
      };
    } catch {
      return { killed: false, reason: "" };
    }
  }
}

export async function checkRemoteKillSwitch(
  baseUrl: string | undefined,
  call: ToolCall,
): Promise<{ killed: boolean; reason: string }> {
  if (!baseUrl) {
    return { killed: false, reason: "" };
  }

  const client = new HttpKillSwitchClient(baseUrl);
  const result = await client.check(call);
  if (!result.killed) {
    return { killed: false, reason: "" };
  }

  return {
    killed: true,
    reason: result.reason || `Kill switch (${result.scope ?? "remote"})`,
  };
}
