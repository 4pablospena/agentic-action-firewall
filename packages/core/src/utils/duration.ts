const DURATION = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/;

export function parseDurationMs(value: string): number {
  const match = DURATION.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case "ms":
      return amount;
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60_000;
    case "h":
      return amount * 3_600_000;
    default:
      return amount;
  }
}
