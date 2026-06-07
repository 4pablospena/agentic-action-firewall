import type { BehaviorBaseline, ObservationEvent } from "@agent-firewall/core";
import { baselineToPolicyYamlSnippet } from "@agent-firewall/core";
import { validateBaseline } from "@agent-firewall/schemas/baseline";
import { validateObservationEvent } from "@agent-firewall/schemas/event";

export function parseLearningUpload(body: unknown): {
  agentId: string;
  baseline: BehaviorBaseline;
  events?: ObservationEvent[];
} {
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Request body is required" });
  }

  const payload = body as {
    agentId?: string;
    baseline?: unknown;
    events?: unknown;
  };

  if (!payload.agentId || typeof payload.agentId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "agentId is required" });
  }

  if (!payload.baseline) {
    throw createError({ statusCode: 400, statusMessage: "baseline is required" });
  }

  const baselineResult = validateBaseline(payload.baseline);
  if (!baselineResult.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Baseline validation failed",
      data: baselineResult.errors,
    });
  }

  const baseline = baselineResult.data as BehaviorBaseline;

  if (baseline.agent_id !== payload.agentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "baseline.agent_id must match agentId",
    });
  }

  let events: ObservationEvent[] | undefined;
  if (payload.events !== undefined) {
    if (!Array.isArray(payload.events)) {
      throw createError({ statusCode: 400, statusMessage: "events must be an array" });
    }

    events = [];
    for (const event of payload.events) {
      const eventResult = validateObservationEvent(event);
      if (!eventResult.valid) {
        throw createError({
          statusCode: 400,
          statusMessage: "Observation event validation failed",
          data: eventResult.errors,
        });
      }
      events.push(eventResult.data as ObservationEvent);
    }
  }

  return {
    agentId: payload.agentId,
    baseline,
    events,
  };
}

export function buildApprovedPolicyYaml(
  currentYaml: string | undefined,
  baseline: BehaviorBaseline,
  approvedTools: Record<string, boolean>,
  thresholdOverrides: Record<string, { perHour?: number; minIntervalSeconds?: number }>,
): string {
  const snippet = baselineToPolicyYamlSnippet(baseline);
  const lines = snippet.split("\n");

  const adjusted = lines.map((line) => {
    for (const [toolName, settings] of Object.entries(thresholdOverrides)) {
      if (!approvedTools[toolName]) {
        continue;
      }
      if (settings.perHour !== undefined && line.includes("per_hour:") && lines[lines.indexOf(line) - 1]?.includes(`${toolName}:`)) {
        return `      per_hour: ${settings.perHour}`;
      }
      if (settings.minIntervalSeconds !== undefined && line.includes("min_interval:")) {
        return `      min_interval: ${settings.minIntervalSeconds}s`;
      }
    }
    return line;
  });

  const approvedSnippet = adjusted.filter((line) => {
    const toolLine = line.match(/^  ([a-z][a-z0-9_.-]+):$/);
    if (!toolLine?.[1]) {
      return true;
    }
    return approvedTools[toolLine[1]] !== false;
  });

  const header = currentYaml?.trim() ? `${currentYaml.trim()}\n\n` : 'version: "1"\n\n';
  return `${header}# Approved from Learning Mode review\n${approvedSnippet.join("\n")}\n`;
}
