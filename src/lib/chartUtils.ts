export type RawChartDataPoint = {
  date: string; // ISO string representing exact timestamp
  score: number;
};

export type ChartDataPoint = {
  date: string; // The original timestamp
  displayDate: string; // "Aug 9" (one label per day)
  fullDateTime: string; // "Aug 9, 2026" (calendar date only, no time)
  score: number;
};

/**
 * Prepares raw performance data for Recharts.
 *
 * Pipeline:
 *   records
 *   → valid completed records
 *   → group by local calendar date
 *   → sort each day by exact completion timestamp
 *   → take the LATEST completed interview for each day
 *   → one point per calendar day
 *   → chronological chart data
 *
 * Scores are NEVER transformed: the point for a day is exactly the score
 * stored for the latest completed interview on that calendar day.
 */
export function prepareChartData<T extends RawChartDataPoint>(
  data: T[]
): ChartDataPoint[] {
  if (!data || data.length === 0) return [];

  // 1. Filter out invalid records (null/undefined scores, invalid dates). Keep 0.
  const validData = data.filter(
    (item) =>
      item.score !== null &&
      item.score !== undefined &&
      !Number.isNaN(item.score) &&
      !Number.isNaN(new Date(item.date).getTime())
  );

  if (validData.length === 0) return [];

  // Local calendar date key (user's local timezone)
  const localDayKey = (dateObj: Date) =>
    `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

  // 2. Group records by local calendar date
  const dailyGroups = new Map<string, T[]>();
  validData.forEach((item) => {
    const key = localDayKey(new Date(item.date));
    if (!dailyGroups.has(key)) dailyGroups.set(key, []);
    dailyGroups.get(key)!.push(item);
  });

  // 3. For each day, sort by exact completion timestamp and take the latest record
  const dailyPoints: T[] = [];
  dailyGroups.forEach((records) => {
    const latest = [...records].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[records.length - 1];
    dailyPoints.push(latest);
  });

  // 4. Sort the daily points chronologically
  dailyPoints.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 5. Map to chart points — one per calendar day, date-only labels, no time
  const chartLocale = "en-US";
  return dailyPoints.map((item) => {
    const dateObj = new Date(item.date);
    return {
      date: item.date,
      displayDate: dateObj.toLocaleDateString(chartLocale, {
        month: "short",
        day: "numeric",
      }),
      fullDateTime: dateObj.toLocaleDateString(chartLocale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      score: item.score!,
    };
  });
}
