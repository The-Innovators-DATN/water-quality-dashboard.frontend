import { sub } from "date-fns";
import type { Duration } from "@/lib/types/duration";

export function parseTimeRange(range: { from: string; to: string }): { from: Date; to: Date } {
  const parse = (input: string): Date => {
    const now = new Date();
    if (input === "now") return now;

    const match = input.match(/now-(\d+)([smhdMy])/);
    if (!match) return now;

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
    return sub(now, { [durationUnit]: amount });
  };

  return {
    from: parse(range.from),
    to: parse(range.to),
  };
}
