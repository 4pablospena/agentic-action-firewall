import type { Firewall, WrapContext, WrapOptions } from "@agent-firewall/core";
import {
  buildToolCall,
  guardToolExecution,
} from "@agent-firewall/core";

export interface LangChainToolLike {
  name: string;
  invoke(input: Record<string, unknown>): Promise<unknown>;
}

export function wrapLangChainTools(
  firewall: Firewall,
  tools: LangChainToolLike[],
  context: WrapContext,
  options?: { mapCall?: WrapOptions["mapCall"] },
): LangChainToolLike[] {
  const wrapOptions: WrapOptions = {
    context,
    ...(options?.mapCall ? { mapCall: options.mapCall } : {}),
  };

  return tools.map((tool) => ({
    ...tool,
    invoke: async (input: Record<string, unknown>) => {
      const agentTool = {
        name: tool.name,
        execute: (args: Record<string, unknown>) => tool.invoke(args),
      };
      const call = buildToolCall(tool.name, input, agentTool, wrapOptions);
      return guardToolExecution(firewall, call, () => tool.invoke(input));
    },
  }));
}

export type { WrapContext, WrapOptions } from "@agent-firewall/core";
