import type { Run } from "./runs";

const WEEKS_PER_PAGE = 260;
const DAY_MS = 24 * 60 * 60 * 1000;

function weekStart(value: number): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function calendarDay(date: Date): number {
  const utc = new Date(0);
  utc.setUTCHours(0, 0, 0, 0);
  utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utc.getTime() / DAY_MS);
}

export function getWeeklyDistances(runs: Run[], now: number, cutoff: number | null, pageOffset = 0) {
  const currentWeek = weekStart(now);
  const currentDay = calendarDay(currentWeek);
  let undatedCount = 0;
  const grouped = new Map<number, { start: Date; end: Date; runs: Run[]; distance: number }>();

  for (const run of runs) {
    const time = Date.parse(run.date);
    if (!Number.isFinite(time)) {
      undatedCount += 1;
      continue;
    }
    const start = weekStart(time);
    const day = calendarDay(start);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    if (!Number.isFinite(day) || !Number.isFinite(end.getTime())) {
      undatedCount += 1;
      continue;
    }
    const group = grouped.get(day) ?? { start, end, runs: [], distance: 0 };
    group.runs.push(run);
    group.distance += run.distanceKm;
    grouped.set(day, group);
  }

  const groups = [...grouped.entries()].sort(([a], [b]) => a - b);
  const pageCount = Math.max(1, Math.ceil(groups.length / WEEKS_PER_PAGE));
  const page = Math.min(Math.max(0, pageOffset), pageCount - 1);
  const lastIndex = groups.length - page * WEEKS_PER_PAGE;
  const firstIndex = Math.max(0, lastIndex - WEEKS_PER_PAGE);
  const weeks = groups.slice(firstIndex, lastIndex).map(([day, group]) => ({
    start: group.start,
    end: group.end,
    runs: [...group.runs].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    distance: group.distance,
    current: day === currentDay,
    partial: cutoff !== null && cutoff > group.start.getTime() && cutoff < group.end.getTime(),
  }));
  let maxDistance = 10;
  for (const group of grouped.values()) maxDistance = Math.max(maxDistance, group.distance);
  return {
    weeks,
    maxDistance,
    thisWeek: grouped.get(currentDay)?.distance ?? 0,
    page,
    pageCount,
    undatedCount,
  };
}
