import type { Firewall, WrapContext, WrapOptions } from "@agent-firewall/core";
import {
  buildToolCall,
  guardToolExecution,
} from "@agent-firewall/core";

export interface OpenAIToolLike {
  name: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export function wrapOpenAITools(
  firewall: Firewall,
  tools: OpenAIToolLike[],
  context: WrapContext,
  options?: { mapCall?: WrapOptions["mapCall"] },
): OpenAIToolLike[] {
  const wrapOptions: WrapOptions = {
    context,
    ...(options?.mapCall ? { mapCall: options.mapCall } : {}),
  };

  return tools.map((tool) => ({
    ...tool,
    execute: async (args: Record<string, unknown>) => {
      const call = buildToolCall(tool.name, args, tool, wrapOptions);
      return guardToolExecution(firewall, call, () => tool.execute(args));
    },
  }));
}

export type { WrapContext, WrapOptions } from "@agent-firewall/core";
