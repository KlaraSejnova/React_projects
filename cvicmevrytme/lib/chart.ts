import type { Run, TrackPoint } from "./runs";

export type ChartPoint = { x: number; y: number };
export type ChartMetric = "pace" | "heartRate" | "elevation";

const COMPARE_COLORS = ["#57bfff", "#f2bf4b", "#c2ccd1"];

export function getCompareColor(index: number): string {
  if (COMPARE_COLORS[index]) return COMPARE_COLORS[index];
  const hues = [200, 45, 0];
  const hue = hues[index % hues.length];
  const lightness = 48 + (Math.floor(index / hues.length) % 5) * 8;
  return `hsl(${hue} 62% ${lightness}%)`;
}

export function toggleRunSelection(selectedIds: string[], id: string): string[] {
  return selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id];
}

export function toggleRunGroup(selectedIds: string[], groupIds: string[]): string[] {
  const selected = new Set(selectedIds);
  if (groupIds.every((id) => selected.has(id))) {
    const group = new Set(groupIds);
    return selectedIds.filter((id) => !group.has(id));
  }
  return [...new Set([...selectedIds, ...groupIds])];
}

export function getChartBounds(series: { run: Run; points: TrackPoint[] }[], metric: ChartMetric): {
  maxDistance: number;
  minValue: number;
  maxValue: number;
} {
  let maxDistance = 1;
  let minValue = Infinity;
  let maxValue = -Infinity;
  for (const { run, points } of series) {
    maxDistance = Math.max(maxDistance, run.distanceKm);
    for (const point of points) {
      maxDistance = Math.max(maxDistance, point.km);
      const value = metric === "pace" ? point.paceSecondsPerKm : metric === "heartRate" ? point.heartRate : point.elevationM;
      if (value !== undefined) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }
  }
  return minValue === Infinity ? { maxDistance, minValue: 0, maxValue: 1 } : { maxDistance, minValue, maxValue };
}

export function hasTrackMetric(point: TrackPoint, metric: ChartMetric): boolean {
  return metric === "pace"
    ? point.paceSecondsPerKm !== undefined
    : metric === "heartRate"
      ? point.heartRate !== undefined
      : point.elevationM !== undefined;
}

export function getChartTrack(run: Run, metric: ChartMetric, showElevationSummary = true): TrackPoint[] {
  const points = run.track.filter((point) => hasTrackMetric(point, metric));
  if (points.length > 1) return points;

  const value = metric === "pace"
    ? run.averagePaceSecondsPerKm
    : metric === "heartRate"
      ? run.averageHeartRate
      : showElevationSummary ? run.elevationM : undefined;
  const key = metric === "pace" ? "paceSecondsPerKm" : metric === "heartRate" ? "heartRate" : "elevationM";
  return value === undefined
    ? []
    : [{ km: 0, [key]: value }, { km: run.distanceKm, [key]: value }];
}

export function smoothChartPath(points: ChartPoint[]): string {
  if (!points.length) return "";
  const rounded = points.map(({ x, y }) => ({
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  }));
  const format = (value: number) => value.toFixed(2);
  const first = rounded[0];
  const path = [`M ${format(first.x)} ${format(first.y)}`];
  if (rounded.length === 1) return path[0];

  const widths = rounded.slice(1).map((point, index) => point.x - rounded[index].x);
  const slopes = widths.map((width, index) =>
    width > 0 ? (rounded[index + 1].y - rounded[index].y) / width : undefined,
  );
  const tangents = rounded.map((_, index) => {
    if (index === 0) return slopes[0] ?? 0;
    if (index === rounded.length - 1) return slopes[index - 1] ?? 0;
    const before = slopes[index - 1];
    const after = slopes[index];
    if (before === undefined || after === undefined || before * after <= 0) return 0;
    const beforeWidth = widths[index - 1];
    const afterWidth = widths[index];
    const beforeWeight = 2 * afterWidth + beforeWidth;
    const afterWeight = afterWidth + 2 * beforeWidth;
    return (beforeWeight + afterWeight) / (beforeWeight / before + afterWeight / after);
  });

  for (let index = 0; index < widths.length; index += 1) {
    const start = rounded[index];
    const end = rounded[index + 1];
    const width = widths[index];
    if (width <= 0 || rounded.length === 2 || start.y === end.y) {
      path.push(`L ${format(end.x)} ${format(end.y)}`);
      continue;
    }
    const third = width / 3;
    path.push(
      `C ${format(start.x + third)} ${format(start.y + third * tangents[index])} ` +
      `${format(end.x - third)} ${format(end.y - third * tangents[index + 1])} ` +
      `${format(end.x)} ${format(end.y)}`,
    );
  }
  return path.join(" ");
}
