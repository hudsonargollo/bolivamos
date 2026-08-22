import type { EventFilter } from "@bolivamos/api-schema";

/**
 * Computes a [startIso, endIso) window for each feed filter (PRD 4.1).
 * Uses UTC day boundaries — Santa Cruz de la Sierra is UTC-4, so shift these
 * by -4h before going to production if events must line up with local
 * midnight exactly.
 */
export function windowForFilter(filter: EventFilter, now = new Date()): { start: Date; end: Date } {
  const startOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

  const today = startOfDay(now);

  switch (filter) {
    case "today":
      return { start: today, end: addDays(today, 1) };
    case "tomorrow":
      return { start: addDays(today, 1), end: addDays(today, 2) };
    case "sunday": {
      const daysUntilSunday = (7 - today.getUTCDay()) % 7;
      const sunday = addDays(today, daysUntilSunday);
      return { start: sunday, end: addDays(sunday, 1) };
    }
    case "weekend": {
      const daysUntilFriday = (5 - today.getUTCDay() + 7) % 7;
      const friday = addDays(today, daysUntilFriday);
      return { start: friday, end: addDays(friday, 3) }; // Fri 00:00 -> Mon 00:00
    }
  }
}
