export function parseDurationToSeconds(value: string, defaultSeconds: number): number {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return defaultSeconds;
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const match = normalized.match(/^(\d+)(s|m|h|d)$/);

  if (!match) {
    return defaultSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return defaultSeconds;
  }
}

export function secondsFromNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}