export type RawChartDataPoint = {
  date: string; // ISO string representing exact timestamp
  score: number;
};

export type ChartDataPoint = {
  date: string; // The original timestamp
  displayDate: string; // "Aug 11" or "" (only first point of day has label)
  fullDateTime: string; // "Aug 11, 2026"
  score: number;
  dailyStats: {
    max: number;
    min: number;
    avg: number;
  };
};

/**
 * Prepares raw performance data for Recharts.
 * Sorts chronologically and formats dates, but preserves EVERY individual session.
 * Does NOT aggregate or modify scores.
 */
export function prepareChartData<T extends RawChartDataPoint>(
  data: T[]
): ChartDataPoint[] {
  if (!data || data.length === 0) return [];

  // Filter out invalid null/undefined scores, but keep 0
  const validData = data.filter((item) => item.score !== null && item.score !== undefined);

  // 1. Sort strictly by timestamp ascending
  const sortedData = [...validData].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 2. Group by date to calculate daily stats
  const dailyGroups = new Map<string, number[]>();
  sortedData.forEach((item) => {
    const dateObj = new Date(item.date);
    const dayKey = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    if (!dailyGroups.has(dayKey)) dailyGroups.set(dayKey, []);
    dailyGroups.get(dayKey)!.push(item.score!);
  });

  const dailyStats = new Map<string, { max: number; min: number; avg: number }>();
  dailyGroups.forEach((scores, dayKey) => {
    dailyStats.set(dayKey, {
      max: Math.max(...scores),
      min: Math.min(...scores),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    });
  });

  // 3. Map every individual valid session to a chart point
  const seenDates = new Set<string>();

  const chartPoints = sortedData.map((item) => {
    const dateObj = new Date(item.date);
    const dayKey = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const shortDayKey = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    
    let displayLabel = "";
    if (!seenDates.has(dayKey)) {
      displayLabel = shortDayKey;
      seenDates.add(dayKey);
    }
    
    return {
      date: item.date,
      displayDate: displayLabel,
      fullDateTime: dateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
      score: item.score!,
      dailyStats: dailyStats.get(dayKey)!,
    };
  });

  return chartPoints;
}
