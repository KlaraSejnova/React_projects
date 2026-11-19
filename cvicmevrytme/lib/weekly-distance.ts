import type { Run } from "./runs";

export function getWeeklyDistances(runs: Run[], now: number) {
  const currentWeek = new Date(now);
  currentWeek.setHours(0, 0, 0, 0);
  currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 6) % 7));

  return Array.from({ length: 5 }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (4 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const weekRuns = runs.filter((run) => {
      const date = new Date(run.date);
      return date >= start && date < end;
    });
    const distance = weekRuns.reduce((total, run) => total + run.distanceKm, 0);
    weekRuns.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    return {
      start,
      end,
      runs: weekRuns,
      distance,
      current: index === 4,
    };
  });
}
