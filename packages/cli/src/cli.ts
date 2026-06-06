import { VERSION } from "@agent-firewall/core";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(`aaf/${VERSION}`);
  process.exit(0);
}

console.log("Agent Action Firewall CLI — MVP under construction.");
console.log(`Version: ${VERSION}`);
console.log("");
console.log("Run `aaf --version` for version info.");
