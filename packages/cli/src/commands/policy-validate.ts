import {
  formatPolicyErrors,
  loadPolicyFromPath,
  PolicyValidationError,
} from "@agent-firewall/core";

export function runPolicyValidate(path: string | undefined): number {
  if (!path) {
    console.error("Usage: aaf policy validate <path>");
    return 2;
  }

  try {
    loadPolicyFromPath(path);
    console.log(`✓ ${path} is valid`);
    return 0;
  } catch (error: unknown) {
    if (error instanceof PolicyValidationError) {
      console.error(`✗ ${path} is invalid`);
      if (error.errors.length > 0) {
        console.error(formatPolicyErrors(error.errors));
      } else {
        console.error(error.message);
      }
      return 1;
    }

    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}
