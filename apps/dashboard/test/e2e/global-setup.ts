import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

function runScript(script: string, args: string[] = []) {
  const result = spawnSync(process.execPath, [join(appRoot, "scripts", script), ...args], {
    cwd: appRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed with exit code ${result.status}`);
  }
}

export default function globalSetup() {
  runScript("migrate.mjs");
  runScript("seed-demo.mjs", ["--force"]);
}
