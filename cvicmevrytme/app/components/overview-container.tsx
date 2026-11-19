import type { Run } from "@/lib/runs";
import { getCompareColor } from "@/lib/chart";
import EmptyState from "./empty-state";
import { formatPace } from "./format";
import Icon from "./app-icon";
import LineChart from "./line-chart";
import MetricCard from "./metric-card";
import RunList from "./run-list";
import type { Page, Period } from "./types";
import WeekDistanceChart from "./week-distance-chart";

export default function OverviewContainer({ runs, visibleRuns, sortedRuns, comparedRuns, now, period, setPeriod, setActivePage, deleteRun }: {
  runs: Run[];
  visibleRuns: Run[];
  sortedRuns: Run[];
  comparedRuns: Run[];
  now: number;
  period: Period;
  setPeriod: (period: Period) => void;
  setActivePage: (page: Page) => void;
  deleteRun: (id: string) => void;
}) {
  const totalDistance = visibleRuns.reduce((total, run) => total + run.distanceKm, 0);
  const totalDuration = visibleRuns.reduce((total, run) => total + run.durationSeconds, 0);
  const averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0;

  return (
  <>
    <div className="section-row period-row">
      <h2>Souhrn aktivity</h2>
      <div className="period-control" aria-label="Období souhrnu">
        {(["30", "90", "all"] as Period[]).map((option) => (
          <button
            aria-pressed={period === option}
            className={period === option ? "selected" : ""}
            key={option}
            onClick={() => setPeriod(option)}
          >
            {option === "all" ? "Celkem" : `${option} dní`}
          </button>
        ))}
      </div>
    </div>
    <div className="metric-grid">
      <MetricCard icon="distance" label="Uběhnutá vzdálenost" value={`${totalDistance.toFixed(1)} km`} foot={`${visibleRuns.length} běhů v období`} />
      <MetricCard icon="runs" label="Počet běhů" value={String(visibleRuns.length)} foot="Každý kilometr se počítá" />
      <MetricCard icon="pace" label="Průměrné tempo" value={averagePace ? `${formatPace(averagePace)} /km` : "—"} foot="Vážené podle vzdálenosti" />
    </div>

    <div className="dashboard-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Týdenní kilometry</h2>
            <p>Jak se ti dařilo posledních 5 týdnů</p>
          </div>
          <span className="chart-legend"><span className="legend-dot" /> Vzdálenost</span>
        </div>
        <WeekDistanceChart runs={runs} now={now} />
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Rychlé srovnání</h2>
            <p>Průběh tempa podle vzdálenosti</p>
          </div>
          <button className="text-button" onClick={() => setActivePage("compare")}>Porovnat <Icon name="arrow" size={12} /></button>
        </div>
        <LineChart runs={comparedRuns.slice(0, 2)} metric="pace" />
        <div className="chart-legend">
          {comparedRuns.slice(0, 2).map((run, index) => (
            <span key={run.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 12 }}>
              <span className="compare-color" style={{ background: getCompareColor(index) }} />
              {run.title}
            </span>
          ))}
        </div>
      </section>
    </div>

    <section>
      <div className="section-row">
        <h2>Poslední běhy</h2>
        <button className="text-button" onClick={() => setActivePage("runs")}>Zobrazit všechny <Icon name="arrow" size={12} /></button>
      </div>
      {sortedRuns.length ? <RunList runs={sortedRuns.slice(0, 4)} onDelete={deleteRun} /> : <EmptyState />}
    </section>
  </>
  );
}
