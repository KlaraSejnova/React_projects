import type { Run } from "@/lib/runs";
import EmptyState from "./empty-state";
import RunList from "./run-list";
import type { Period } from "./types";

export default function RunsContainer({ visibleRuns, period, setPeriod, deleteRun }: {
  visibleRuns: Run[];
  period: Period;
  setPeriod: (period: Period) => void;
  deleteRun: (id: string) => void;
}) {
  return (
  <section>
    <div className="section-row">
      <h2>{visibleRuns.length} {visibleRuns.length === 1 ? "běh" : visibleRuns.length < 5 ? "běhy" : "běhů"}</h2>
      <div className="period-control" aria-label="Období běhů">
        {(["30", "90", "all"] as Period[]).map((option) => (
          <button
            aria-pressed={period === option}
            className={period === option ? "selected" : ""}
            key={option}
            onClick={() => setPeriod(option)}
          >
            {option === "all" ? "Všechny" : `${option} dní`}
          </button>
        ))}
      </div>
    </div>
    {visibleRuns.length ? (
      <>
        <div className="table-head"><span>Běh</span><span>Vzdálenost</span><span>Tempo</span><span>Zdroj</span></div>
        <RunList runs={visibleRuns} onDelete={deleteRun} expandable />
        <p className="import-hint">Pro porovnání označ běhy v části <strong>Porovnání</strong>.</p>
      </>
    ) : <EmptyState />}
  </section>
  );
}
