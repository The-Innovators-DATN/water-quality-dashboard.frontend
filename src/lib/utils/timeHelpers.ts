import { sub } from "date-fns";

import type { Duration } from "@/lib/types/duration";

export function parseTimeRange(range: string): { from: Date; to: Date } {
  const now = new Date();
  const match = range.match(/now-(\d+)([smhdMy])/);

  if (!match) return { from: now, to: now };

  const amount = parseInt(match[1], 10);
  const unit = match[2];

  const units: Record<string, keyof Duration> = {
    s: "seconds",
    m: "minutes",
    h: "hours",
    d: "days",
    M: "months",
    y: "years",
  };

  const durationUnit = units[unit];

  return {
    from: sub(now, { [durationUnit]: amount }),
    to: now,
  };
}
