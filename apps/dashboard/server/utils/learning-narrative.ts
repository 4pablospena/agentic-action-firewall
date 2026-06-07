import type { BehaviorBaseline, ObservationEvent } from "@agent-firewall/core";

export function buildLearningNarrative(baseline: BehaviorBaseline): string {
  const lines: string[] = [
    `Over the observation window, agent **${baseline.agent_id}** recorded **${baseline.observation_period.total_actions}** actions.`,
  ];

  const toolSummaries = Object.entries(baseline.tools)
    .sort((a, b) => b[1].usage_count - a[1].usage_count)
    .slice(0, 5)
    .map(([toolName, profile]) =>
      `- **${toolName}**: ${profile.usage_count} calls (p95 ${profile.calls_per_hour_p95}/hour, min interval ${Math.round(profile.min_interval_observed_ms / 1000)}s)`,
    );

  if (toolSummaries.length > 0) {
    lines.push("", "Top tools observed:", ...toolSummaries);
  }

  lines.push(
    "",
    `Confidence score: **${baseline.confidence.confidence_score.toFixed(2)}** (${baseline.confidence.sample_size} samples, ${baseline.confidence.days_of_data.toFixed(1)} days).`,
  );

  if (baseline.confidence.weak_signals.length > 0) {
    lines.push(
      "",
      `Weak signals (fewer than 5 samples): ${baseline.confidence.weak_signals.join(", ")}.`,
    );
  }

  return lines.join("\n");
}

export interface RankedOutlier {
  event: ObservationEvent;
  score: number;
  reason: string;
}

export function rankObservationOutliers(
  events: ObservationEvent[],
  limit = 5,
): RankedOutlier[] {
  if (events.length === 0) {
    return [];
  }

  const byTool = new Map<string, number[]>();
  for (const event of events) {
    const intervals = byTool.get(event.tool_name) ?? [];
    intervals.push(event.time_since_last_action_ms);
    byTool.set(event.tool_name, intervals);
  }

  const medians = new Map<string, number>();
  for (const [tool, intervals] of byTool) {
    const sorted = [...intervals].sort((a, b) => a - b);
    medians.set(tool, sorted[Math.floor(sorted.length / 2)] ?? 0);
  }

  const ranked: RankedOutlier[] = [];

  for (const event of events) {
    let score = 0;
    const reasons: string[] = [];

    if (event.batch_size > 10) {
      score += event.batch_size;
      reasons.push(`batch size ${event.batch_size}`);
    }

    if (event.recipients.length > 5) {
      score += event.recipients.length * 2;
      reasons.push(`${event.recipients.length} recipients`);
    }

    const median = medians.get(event.tool_name) ?? 0;
    if (median > 0 && event.time_since_last_action_ms < median * 0.25) {
      score += 10;
      reasons.push("unusually fast follow-up");
    }

    if (event.payload_size_bytes > 10_000) {
      score += 5;
      reasons.push("large payload");
    }

    if (score > 0) {
      ranked.push({
        event,
        score,
        reason: reasons.join("; "),
      });
    }
  }

  return ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
