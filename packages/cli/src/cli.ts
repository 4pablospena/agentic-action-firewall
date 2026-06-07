import { VERSION } from "@agent-firewall/core";
import { runLearningExport, runLearningStatus } from "./commands/learning.js";
import { runPolicyValidate } from "./commands/policy-validate.js";

const args = process.argv.slice(2);

function printHelp(): void {
  console.log(`Agent Action Firewall CLI (aaf) v${VERSION}

Usage:
  aaf --version
  aaf policy validate <path>
  aaf learning status --agent <id> --input <events.json>
  aaf learning export --agent <id> --input <events.json> [--output <file>]

Commands:
  policy validate   Validate firewall.yml against policy.schema.json
  learning status   Summarize observation events for an agent
  learning export   Build baseline JSON and policy YAML snippet from events
`);
}

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 0 : 0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log(`aaf/${VERSION}`);
  process.exit(0);
}

if (args[0] === "policy" && args[1] === "validate") {
  process.exit(runPolicyValidate(args[2]));
}

if (args[0] === "learning" && args[1] === "status") {
  process.exit(runLearningStatus(args.slice(2)));
}

if (args[0] === "learning" && args[1] === "export") {
  process.exit(runLearningExport(args.slice(2)));
}

console.error(`Unknown command: ${args.join(" ")}`);
printHelp();
process.exit(2);
