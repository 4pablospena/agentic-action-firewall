import { VERSION } from "@agent-firewall/core";
import { runPolicyValidate } from "./commands/policy-validate.js";

const args = process.argv.slice(2);

function printHelp(): void {
  console.log(`Agent Action Firewall CLI (aaf) v${VERSION}

Usage:
  aaf --version
  aaf policy validate <path>

Commands:
  policy validate   Validate firewall.yml against policy.schema.json
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

console.error(`Unknown command: ${args.join(" ")}`);
printHelp();
process.exit(2);
