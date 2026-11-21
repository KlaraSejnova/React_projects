import { useMemo } from "react";
import type { Run } from "@/lib/runs";
import { getCompareColor } from "@/lib/chart";
import { groupGpsRoutes, projectGpsRoutes, type GpsRoute } from "@/lib/gps";
import { formatDate } from "./format";
import LineChart from "./line-chart";
import RoutePreview from "./route-preview";
import RunList from "./run-list";
import type { ChartMetric } from "./types";

export default function ComparisonContainer({ gpsRoutes, comparedRuns, routeRun, metric, setMetric, toggleComparison, toggleGroup, deleteRun }: {
  gpsRoutes: GpsRoute[];
  comparedRuns: Run[];
  routeRun: Run | undefined;
  metric: ChartMetric;
  setMetric: (metric: ChartMetric) => void;
  toggleComparison: (id: string) => void;
  toggleGroup: (ids: string[]) => void;
  deleteRun: (id: string) => void;
}) {
  const selectedColors = new Map(comparedRuns.map((run, index) => [run.id, getCompareColor(index)]));
  const groups = useMemo(() => groupGpsRoutes(gpsRoutes).map((group) => {
    const previewRoute = group.routes.find(({ run }) => run.id === routeRun?.id) ?? group.routes[0];
    return {
      ...group,
      preview: projectGpsRoutes([previewRoute])[0],
    };
  }), [gpsRoutes, routeRun]);
  return (
  <section className="panel comparison-panel">
    <div className="panel-heading">
      <div>
        <h2>Vyber běhy k porovnání</h2>
        <p>Tempo se zobrazuje v minutách na kilometr.</p>
      </div>
      <div className="period-control" aria-label="Metrika grafu">
        {([
          ["pace", "Tempo"],
          ["elevation", "Převýšení"],
        ] as [ChartMetric, string][]).map(([option, label]) => (
          <button
            aria-pressed={metric === option}
            className={metric === option ? "selected" : ""}
            key={option}
            onClick={() => setMetric(option)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
    {gpsRoutes.length ? (
      <div className="route-groups">
        <p className="route-groups-hint">
          Podobné trasy jsou seskupené i při opačném směru. Shoda je orientační: délka běhů se může lišit až o 20 % a alespoň 80 % vzorků z každé trasy musí být do 70 m od druhé trasy.
        </p>
        {groups.map((group, index) => {
          const ids = group.routes.map(({ run }) => run.id);
          const selectedCount = ids.filter((id) => selectedColors.has(id)).length;
          const allSelected = selectedCount === ids.length;
          return (
            <details className="route-group" key={group.routes[0].run.id}>
              <summary className="route-group-summary">
                <svg aria-hidden="true" className="route-group-preview" viewBox="0 0 1000 500">
                  <path d={group.preview.path} />
                  <circle cx={group.preview.start.x} cy={group.preview.start.y} r="18" />
                </svg>
                <span>
                  <strong>Trasa {index + 1}</strong>
                  <small>{ids.length} {ids.length === 1 ? "běh" : ids.length < 5 ? "běhy" : "běhů"} · {selectedCount} vybráno</small>
                  {group.insufficientGps && <small>Trasu nelze spolehlivě zařadit podle GPS.</small>}
                </span>
              </summary>
              <div className="route-group-content">
                <button className="text-button" onClick={() => toggleGroup(ids)} type="button">
                  {allSelected ? "Zrušit výběr skupiny" : "Vybrat celou skupinu"}
                </button>
                <div className="compare-controls" aria-label={`Běhy ve skupině Trasa ${index + 1}`}>
                  {group.routes.map(({ run }) => {
                    const selected = selectedColors.has(run.id);
                    return (
                      <button
                        aria-pressed={selected}
                        className={`compare-chip${selected ? " selected" : ""}`}
                        key={run.id}
                        onClick={() => toggleComparison(run.id)}
                        type="button"
                      >
                        <span className="compare-color" style={{ background: selectedColors.get(run.id) ?? "#8e9497" }} />
                        {run.title} · {formatDate(run.date)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    ) : (
      <div className="compare-empty">Žádný běh nemá dostatek GPS bodů pro zobrazení a porovnání.</div>
    )}
    {comparedRuns.length ? (
      <LineChart runs={comparedRuns} metric={metric} />
    ) : (
      <div className="compare-empty">Vyber alespoň jeden běh, který chceš porovnat.</div>
    )}
    {routeRun && <RoutePreview run={routeRun} />}
    <div className="section-row">
      <h2>Souhrn vybraných běhů</h2>
      <span className="import-hint">{comparedRuns.length} vybráno</span>
    </div>
    {comparedRuns.length ? (
      <RunList runs={comparedRuns} onDelete={deleteRun} colors={selectedColors} expandable />
    ) : <div className="compare-empty">Zatím není vybraný žádný běh.</div>}
  </section>
  );
}
