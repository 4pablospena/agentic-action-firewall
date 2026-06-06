import type { Firewall, WrapContext, WrapOptions } from "@agent-firewall/core";
import {
  buildToolCall,
  guardToolExecution,
} from "@agent-firewall/core";

export interface ClaudeToolLike {
  name: string;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export function wrapClaudeTools(
  firewall: Firewall,
  tools: ClaudeToolLike[],
  context: WrapContext,
  options?: { mapCall?: WrapOptions["mapCall"] },
): ClaudeToolLike[] {
  const wrapOptions: WrapOptions = {
    context,
    ...(options?.mapCall ? { mapCall: options.mapCall } : {}),
  };

  return tools.map((tool) => ({
    ...tool,
    handler: async (args: Record<string, unknown>) => {
      const agentTool = {
        name: tool.name,
        execute: (a: Record<string, unknown>) => tool.handler(a),
      };
      const call = buildToolCall(tool.name, args, agentTool, wrapOptions);
      return guardToolExecution(firewall, call, () => tool.handler(args));
    },
  }));
}

export type { WrapContext, WrapOptions } from "@agent-firewall/core";
