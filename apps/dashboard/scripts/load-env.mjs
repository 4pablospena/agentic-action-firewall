import { existsSync, readFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(appRoot, ".env");
const envExamplePath = join(appRoot, ".env.example");

export function ensureEnvFile() {
  if (existsSync(envPath)) {
    return envPath;
  }

  if (!existsSync(envExamplePath)) {
    throw new Error(
      `Missing ${envPath}. Create it from .env.example before running the dashboard.`,
    );
  }

  copyFileSync(envExamplePath, envPath);
  console.warn(`Created ${envPath} from .env.example — update OAuth credentials before login.`);
  return envPath;
}

export function loadEnvFile(path = envPath) {
  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadDashboardEnv() {
  ensureEnvFile();
  loadEnvFile(envPath);
  return envPath;
}
