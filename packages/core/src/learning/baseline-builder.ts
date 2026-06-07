import type { BehaviorBaseline, ToolProfile, ToolSequence } from "../generated/baseline.js";
import type { ObservationEvent } from "../generated/event.js";

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)] ?? 0;
}

function median(values: number[]): number {
  return percentile(values, 50);
}

function hoursBetween(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, diff / (1000 * 60 * 60));
}

function buildToolProfile(events: ObservationEvent[]): ToolProfile {
  const intervals: number[] = [];
  const recipientsPerCall: number[] = [];
  const payloadSizes: number[] = [];
  const batchSizes: number[] = [];
  const hourlyBuckets = new Map<number, number>();

  for (let i = 1; i < events.length; i += 1) {
    const prev = events[i - 1]!;
    const curr = events[i]!;
    intervals.push(
      new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime(),
    );
  }

  for (const event of events) {
    recipientsPerCall.push(event.recipients.length);
    payloadSizes.push(event.payload_size_bytes);
    batchSizes.push(event.batch_size);
    const hour = Math.floor(new Date(event.timestamp).getTime() / (1000 * 60 * 60));
    hourlyBuckets.set(hour, (hourlyBuckets.get(hour) ?? 0) + 1);
  }

  const hourlyCounts = [...hourlyBuckets.values()];
  const uniqueRecipients = new Set(events.flatMap((event) => event.recipients));

  return {
    usage_count: events.length,
    calls_per_hour_p50: percentile(hourlyCounts, 50),
    calls_per_hour_p95: percentile(hourlyCounts, 95),
    calls_per_hour_max: hourlyCounts.length > 0 ? Math.max(...hourlyCounts) : 0,
    min_interval_observed_ms: intervals.length > 0 ? Math.min(...intervals) : 0,
    median_interval_ms: median(intervals),
    recipients_per_call_p50: percentile(recipientsPerCall, 50),
    recipients_per_call_p95: percentile(recipientsPerCall, 95),
    unique_recipients_total: uniqueRecipients.size,
    recipient_overlap_rate: 0,
    payload_size_p50_bytes: percentile(payloadSizes, 50),
    payload_size_p95_bytes: percentile(payloadSizes, 95),
    payload_similarity_p50: 0,
    payload_similarity_max: 0,
    batch_size_p50: percentile(batchSizes, 50),
    batch_size_p95: percentile(batchSizes, 95),
    batch_size_max: batchSizes.length > 0 ? Math.max(...batchSizes) : 0,
  };
}

function buildSequences(events: ObservationEvent[]): ToolSequence[] {
  const sequences = new Map<string, number>();
  for (let i = 1; i < events.length; i += 1) {
    const key = `${events[i - 1]!.tool_name},${events[i]!.tool_name}`;
    sequences.set(key, (sequences.get(key) ?? 0) + 1);
  }

  return [...sequences.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => {
      const tools = key.split(",") as [string, ...string[]];
      return {
        tools,
        count,
        frequency_p50: count / Math.max(1, events.length),
      };
    });
}

export function buildBaseline(agentId: string, events: ObservationEvent[]): BehaviorBaseline {
  const agentEvents = events
    .filter((event) => event.agent_id === agentId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const start = agentEvents[0]?.timestamp ?? new Date().toISOString();
  const end = agentEvents.at(-1)?.timestamp ?? start;

  const byTool = new Map<string, ObservationEvent[]>();
  for (const event of agentEvents) {
    const list = byTool.get(event.tool_name) ?? [];
    list.push(event);
    byTool.set(event.tool_name, list);
  }

  const tools: BehaviorBaseline["tools"] = {};
  for (const [toolName, toolEvents] of byTool) {
    tools[toolName] = buildToolProfile(toolEvents);
  }

  const sessionCounts = new Map<string, number>();
  const intervals: number[] = [];
  for (let i = 1; i < agentEvents.length; i += 1) {
    intervals.push(
      new Date(agentEvents[i]!.timestamp).getTime()
        - new Date(agentEvents[i - 1]!.timestamp).getTime(),
    );
  }
  for (const event of agentEvents) {
    sessionCounts.set(event.session_id, (sessionCounts.get(event.session_id) ?? 0) + 1);
  }

  const sessionActionCounts = [...sessionCounts.values()];
  const weakSignals = Object.entries(tools)
    .filter(([, profile]) => profile.usage_count < 5)
    .map(([name]) => name);

  return {
    agent_id: agentId,
    observation_period: {
      start,
      end,
      total_actions: agentEvents.length,
    },
    tools,
    global_patterns: {
      actions_per_session_p50: percentile(sessionActionCounts, 50),
      actions_per_session_p95: percentile(sessionActionCounts, 95),
      interval_between_actions_p50_ms: percentile(intervals, 50),
      interval_between_actions_p95_ms: percentile(intervals, 95),
      common_tool_sequences: buildSequences(agentEvents),
    },
    confidence: {
      sample_size: agentEvents.length,
      days_of_data: hoursBetween(start, end) / 24,
      confidence_score: Math.min(1, agentEvents.length / 100),
      weak_signals: weakSignals,
    },
  };
}

export function baselineToPolicyYamlSnippet(baseline: BehaviorBaseline): string {
  const lines = [
    "# Auto-generated from Learning Mode observation",
    `# Confidence: ${baseline.confidence.confidence_score.toFixed(2)} (${baseline.confidence.sample_size} actions)`,
    "learning_mode:",
    "  enabled: false",
    "tools:",
  ];

  for (const [toolName, profile] of Object.entries(baseline.tools)) {
    lines.push(`  ${toolName}:`);
    lines.push("    rate_limits:");
    lines.push(`      per_hour: ${Math.ceil(profile.calls_per_hour_p95 * 1.5)}`);
    lines.push(`      min_interval: ${Math.max(1, Math.floor(profile.min_interval_observed_ms / 1000))}s`);
  }

  return lines.join("\n");
}
