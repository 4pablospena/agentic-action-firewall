import {
  baselineToPolicyYamlSnippet,
  buildBaseline,
  type ObservationEvent,
} from "@agent-firewall/core";
import { readFileSync, writeFileSync } from "node:fs";

function parseArgs(args: string[]) {
  const get = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  return {
    agentId: get("--agent"),
    inputPath: get("--input"),
    outputPath: get("--output"),
  };
}

export function runLearningStatus(args: string[]): number {
  const { agentId, inputPath } = parseArgs(args);
  if (!agentId || !inputPath) {
    console.error("Usage: aaf learning status --agent <id> --input <events.json>");
    return 2;
  }

  const events = loadEvents(inputPath);
  const filtered = events.filter((event) => event.agent_id === agentId);
  console.log(JSON.stringify({
    agentId,
    observationCount: filtered.length,
    firstEvent: filtered[0]?.timestamp ?? null,
    lastEvent: filtered.at(-1)?.timestamp ?? null,
  }, null, 2));
  return 0;
}

export function runLearningExport(args: string[]): number {
  const { agentId, inputPath, outputPath } = parseArgs(args);
  if (!agentId || !inputPath) {
    console.error("Usage: aaf learning export --agent <id> --input <events.json> [--output <file>]");
    return 2;
  }

  const events = loadEvents(inputPath);
  const baseline = buildBaseline(agentId, events);
  const yaml = baselineToPolicyYamlSnippet(baseline);
  const payload = `${JSON.stringify(baseline, null, 2)}\n\n--- policy snippet ---\n${yaml}\n`;

  if (outputPath) {
    writeFileSync(outputPath, payload, "utf8");
    console.log(`Baseline exported to ${outputPath}`);
  } else {
    process.stdout.write(payload);
  }

  return 0;
}

function loadEvents(path: string): ObservationEvent[] {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(raw)) {
    throw new Error("Input file must contain a JSON array of observation events");
  }
  return raw as ObservationEvent[];
}
