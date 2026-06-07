import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_RELATIVE_PATH = join(".aaf", "observations.db");

export function resolveObservationDbPath(explicitPath?: string): string {
  if (explicitPath) {
    return explicitPath;
  }

  const home = homedir();
  if (home && home !== "/") {
    return join(home, ".aaf", "observations.db");
  }

  return DEFAULT_RELATIVE_PATH;
}
