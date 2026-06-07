export function validateObservationEvent(
  document: unknown,
):
  | { valid: true; data: unknown }
  | { valid: false; errors: Array<{ path: string; message: string }> };
