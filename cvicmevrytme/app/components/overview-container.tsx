import type { Run } from "@/lib/runs";
import EmptyState from "./empty-state";
import { formatPace } from "./format";
import Icon from "./app-icon";
import MetricCard from "./metric-card";
import RunList from "./run-list";
import type { Page, Period } from "./types";
import WeekDistanceChart from "./week-distance-chart";

export default function OverviewContainer({ visibleRuns, sortedRuns, now, cutoff, period, setPeriod, setActivePage, deleteRun }: {
  visibleRuns: Run[];
  sortedRuns: Run[];
  now: number;
  cutoff: number | null;
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

    <section className="panel weekly-panel">
      <div className="panel-heading">
        <div>
          <h2>Týdenní kilometry</h2>
          <p>{period === "all" ? "Všechny zaznamenané týdny" : `Týdny za posledních ${period} dní`}</p>
        </div>
        <div className="week-legend" aria-label="Legenda týdenního grafu">
          <span className="chart-legend"><span aria-hidden="true" className="legend-dot week-legend-current" /> Tento týden</span>
          <span className="chart-legend"><span aria-hidden="true" className="legend-dot week-legend-selected" /> Vybraný týden</span>
        </div>
      </div>
      <WeekDistanceChart key={period} runs={visibleRuns} now={now} cutoff={cutoff} />
    </section>

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
