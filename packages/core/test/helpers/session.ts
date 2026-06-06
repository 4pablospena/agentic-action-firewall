import type { Firewall } from "../../src/firewall.js";
import type { FirewallDecision, ToolCall } from "../../src/types.js";

export async function replaySession(
  firewall: Firewall,
  calls: ToolCall[],
): Promise<FirewallDecision[]> {
  const results: FirewallDecision[] = [];
  for (const call of calls) {
    results.push(await firewall.evaluate(call));
  }
  return results;
}

export function spacedCalls(
  factory: (index: number) => ToolCall,
  count: number,
  intervalMs: number,
  baseTime = "2026-02-01T14:00:00.000Z",
): ToolCall[] {
  const base = new Date(baseTime).getTime();
  return Array.from({ length: count }, (_, index) => {
    const call = factory(index);
    return {
      ...call,
      timestamp: new Date(base + index * intervalMs).toISOString(),
    };
  });
}

export function langChainLoopSequence(repetitions: number): ToolCall[] {
  const calls: ToolCall[] = [];
  const base = new Date("2026-02-01T14:00:00.000Z").getTime();
  let t = 0;
  for (let i = 0; i < repetitions; i += 1) {
    calls.push({
      name: "analyzer.run",
      arguments: { step: i },
      agentId: "langchain-pipeline",
      sessionId: "sess_langchain_47k",
      timestamp: new Date(base + t).toISOString(),
      costUsd: 0.5,
    });
    t += 5000;
    calls.push({
      name: "verifier.run",
      arguments: { step: i },
      agentId: "langchain-pipeline",
      sessionId: "sess_langchain_47k",
      timestamp: new Date(base + t).toISOString(),
      costUsd: 0.5,
    });
    t += 5000;
  }
  return calls;
}
