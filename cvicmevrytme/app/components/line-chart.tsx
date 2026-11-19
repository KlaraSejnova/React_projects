import { getChartBounds, getChartTrack, getCompareColor, hasTrackMetric, smoothChartPath, type ChartMetric } from "@/lib/chart";
import type { Run, TrackPoint } from "@/lib/runs";
import { formatPace } from "./format";

export default function LineChart({
  runs,
  metric,
  showElevationSummary = true,
  description,
  color,
}: {
  runs: Run[];
  metric: ChartMetric;
  showElevationSummary?: boolean;
  description?: string;
  color?: string;
}) {
  const chartWidth = 1000;
  const chartHeight = 250;
  const left = 52;
  const right = 18;
  const top = 14;
  const bottom = 35;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const series = runs.map((run, index) => ({
    run,
    color: color ?? getCompareColor(index),
    points: getChartTrack(run, metric, showElevationSummary),
    summaryOnly: run.track.filter((point) => hasTrackMetric(point, metric)).length <= 1,
  })).filter((item) => item.points.length > 1);
  const { maxDistance, minValue, maxValue } = getChartBounds(series, metric);
  const spread = Math.max(maxValue - minValue, 1);
  const min = metric === "pace" ? Math.max(0, minValue - spread * 0.12) : minValue - spread * 0.12;
  const max = maxValue + spread * 0.12;
  const yForValue = (value: number) => {
    const proportion = (value - min) / (max - min);
    return metric === "pace"
      ? top + proportion * plotHeight
      : top + (1 - proportion) * plotHeight;
  };
  const metricValue = (point: TrackPoint) =>
    metric === "pace" ? point.paceSecondsPerKm : metric === "heartRate" ? point.heartRate : point.elevationM;
  const pathFor = (points: TrackPoint[]) =>
    smoothChartPath(points.map((point) => {
      const value = metricValue(point) ?? minValue;
      return {
        x: left + (point.km / maxDistance) * plotWidth,
        y: yForValue(value),
      };
    }));
  const labelForValue = (value: number) =>
    metric === "pace"
      ? formatPace(value)
      : metric === "heartRate"
        ? `${Math.round(value)} bpm`
        : `${Math.round(value)} m`;

  return (
    <div className="chart-wrap">
      {series.length === 0 ? (
        <div className="compare-empty">Pro vybranou metriku nejsou k dispozici naměřené hodnoty.</div>
      ) : (
        <svg
          role="img"
          aria-label={description ?? `Srovnání ${metric === "pace" ? "tempa" : metric === "heartRate" ? "srdečního tepu" : "převýšení"} podle vzdálenosti`}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <title>{description ?? `Srovnání ${metric === "pace" ? "tempa" : metric === "heartRate" ? "srdečního tepu" : "převýšení"} podle vzdálenosti`}</title>
          {[0, 1, 2, 3].map((step) => {
            const y = top + (plotHeight / 3) * step;
            const value = metric === "pace"
              ? min + ((max - min) / 3) * step
              : max - ((max - min) / 3) * step;
            return (
              <g key={step}>
                <line className="chart-gridline" x1={left} x2={chartWidth - right} y1={y} y2={y} />
                <text className="chart-label" x={left - 8} y={y + 3} textAnchor="end">
                  {labelForValue(value)}
                </text>
              </g>
            );
          })}
          {Array.from({ length: 5 }, (_, index) => {
            const km = (maxDistance / 4) * index;
            const x = left + (plotWidth / 4) * index;
            return (
              <text className="chart-label" key={index} x={x} y={chartHeight - 8} textAnchor="middle">
                {km.toFixed(km % 1 ? 1 : 0)} km
              </text>
            );
          })}
          {series.map(({ run, color, points }) => (
            <path
              d={pathFor(points)}
              fill="none"
              key={run.id}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          ))}
        </svg>
      )}
      {series.some((item) => item.summaryOnly) && (
        <p className="import-hint">
          U běhů bez podrobných záznamů představuje rovná čára souhrnnou hodnotu, nikoli naměřený průběh.
        </p>
      )}
      {series.some((item) => item.run.estimatedTrack && !item.summaryOnly) && (
        <p className="import-hint">
          Vzdálenost mezi řídkými body TCX je odhadnutá podle času. Tempo je průměrem přibližně po 500 m; profil je orientační.
        </p>
      )}
      {series.some((item) => !item.summaryOnly && item.points.length > 2) && (
        <p className="import-hint">Pro přehlednost jsou spojnice mezi body jemně zaoblené.</p>
      )}
    </div>
  );
}
