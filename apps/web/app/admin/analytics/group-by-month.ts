/** Buckets rows by the YYYY-MM prefix of a date string, summing an optional value per row. */
export function groupByMonth<T>(
  rows: T[],
  dateOf: (row: T) => string | null,
  valueOf?: (row: T) => number,
): { month: string; count: number; total: number }[] {
  const buckets = new Map<string, { count: number; total: number }>();
  for (const row of rows) {
    const date = dateOf(row);
    if (!date) continue;
    const month = date.slice(0, 7);
    const bucket = buckets.get(month) ?? { count: 0, total: 0 };
    bucket.count += 1;
    bucket.total += valueOf ? valueOf(row) : 0;
    buckets.set(month, bucket);
  }
  return Array.from(buckets.entries())
    .map(([month, b]) => ({ month, ...b }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
