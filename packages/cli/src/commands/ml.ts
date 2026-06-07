import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const mlDir = join(repoRoot, "packages/ml");

export function runMlTrain(args: string[]): number {
  const synthetic = args.includes("--synthetic");

  if (synthetic) {
    const generate = spawnSync("python3", ["generate_synthetic.py"], {
      cwd: mlDir,
      stdio: "inherit",
    });
    if (generate.status !== 0) {
      return generate.status ?? 1;
    }
  }

  const train = spawnSync("python3", ["train.py"], {
    cwd: mlDir,
    stdio: "inherit",
  });

  return train.status ?? 1;
}

export function runMlValidate(args: string[]): number {
  const modelFlag = args.indexOf("--model");
  const modelPath = modelFlag >= 0 ? args[modelFlag + 1] : undefined;

  if (!modelPath) {
    console.error("Usage: aaf ml validate --model <path>");
    return 2;
  }

  if (!existsSync(modelPath)) {
    console.error(`Model not found: ${modelPath}`);
    return 1;
  }

  console.log(`✓ Model file exists: ${modelPath}`);
  return 0;
}

export function runTelemetryExport(args: string[]): number {
  console.log(JSON.stringify({
    status: "stub",
    message: "Opt-in telemetry export will ship with beta program",
    flags: args,
  }, null, 2));
  return 0;
}
