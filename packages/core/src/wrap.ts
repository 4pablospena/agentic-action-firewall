import { FirewallBlockedError } from "./errors.js";
import type {
  AgentTool,
  FirewallDecision,
  GuardOptions,
  ToolCall,
  WrapOptions,
} from "./types.js";
import { DEFAULT_WRAP_CONTEXT } from "./types.js";

export type { GuardOptions };

export interface FirewallEvaluator {
  evaluate(call: ToolCall): Promise<FirewallDecision>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function buildToolCall(
  name: string,
  args: Record<string, unknown>,
  tool: AgentTool,
  options?: WrapOptions,
): ToolCall {
  const context = options?.context ?? DEFAULT_WRAP_CONTEXT;
  const base: ToolCall = {
    name,
    arguments: args,
    agentId: context.agentId,
    sessionId: context.sessionId,
    timestamp: new Date().toISOString(),
    ...(context.costUsd !== undefined ? { costUsd: context.costUsd } : {}),
    ...(context.recipients !== undefined ? { recipients: context.recipients } : {}),
    ...(context.payloadEmbedding !== undefined
      ? { payloadEmbedding: context.payloadEmbedding }
      : {}),
  };

  const overrides = options?.mapCall?.(tool, args, context) ?? {};
  return { ...base, ...overrides, name, arguments: args };
}

export async function guardToolExecution<T>(
  firewall: FirewallEvaluator,
  call: ToolCall,
  execute: () => Promise<T>,
  options?: GuardOptions,
): Promise<T> {
  let decision = await firewall.evaluate(call);
  if (decision.outcome === "allow") {
    return execute();
  }

  if (
    decision.outcome === "pending" &&
    decision.riskTier === "R2" &&
    options?.waitForR2CancelWindow
  ) {
    const cancelWindowMs = options.cancelWindowMs ?? 30_000;
    await sleep(cancelWindowMs);
    decision = await firewall.evaluate(call);
    if (decision.outcome === "allow") {
      return execute();
    }
  }

  throw new FirewallBlockedError(decision);
}

export function wrapAgentTools<T extends AgentTool>(
  firewall: FirewallEvaluator,
  tools: T[],
  options?: WrapOptions,
): T[] {
  const guard = options?.guard;
  return tools.map((tool) => ({
    ...tool,
    execute: async (args: Record<string, unknown>) => {
      const call = buildToolCall(tool.name, args, tool, options);
      return guardToolExecution(firewall, call, () => tool.execute(args), guard);
    },
  }));
}
