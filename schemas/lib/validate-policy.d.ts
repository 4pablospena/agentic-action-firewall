export class PolicyValidationError extends Error {
  label?: string;
  errors: Array<{ path: string; message: string }>;
}

export function validatePolicy(
  document: unknown,
):
  | { valid: true; data: unknown }
  | { valid: false; errors: Array<{ path: string; message: string }> };

export function assertValidPolicy(document: unknown, label?: string): unknown;

export function formatPolicyErrors(
  errors: Array<{ path: string; message: string }>,
): string;
