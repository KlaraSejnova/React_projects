import { useId, useState } from "react";
import type { Run } from "@/lib/runs";
import { formatDate, formatDuration, formatPace } from "./format";
import Icon from "./app-icon";
import LineChart from "./line-chart";

export default function RunList({
  runs,
  onDelete,
  expandable = false,
  colors,
}: {
  runs: Run[];
  onDelete?: (id: string) => void;
  expandable?: boolean;
  colors?: ReadonlyMap<string, string>;
}) {
  return (
    <div className="run-list">
      {runs.map((run) => <RunRow key={run.id} run={run} onDelete={onDelete} expandable={expandable} color={colors?.get(run.id)} />)}
    </div>
  );
}

function RunRow({ run, onDelete, expandable, color }: {
  run: Run;
  onDelete?: (id: string) => void;
  expandable: boolean;
  color?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailId = useId();

  return (
    <article className="run-row">
      <div className="run-row-header">
          {expandable && (
            <button
              aria-controls={detailId}
              aria-expanded={expanded}
              aria-label={`${expanded ? "Skrýt" : "Zobrazit"} detail běhu ${run.title}, ${formatDate(run.date)}`}
              className="run-toggle"
              onClick={() => setExpanded(!expanded)}
              type="button"
            />
          )}
          <div className="run-name">
            <span className="run-glyph"><Icon name="runs" size={17} /></span>
            {color && <span aria-hidden="true" className="run-compare-color" style={{ backgroundColor: color }} />}
            <div>
              <strong>{run.title}</strong>
              <span>{formatDate(run.date)}</span>
              {expandable && <span className="run-detail-hint">{expanded ? "Skrýt detail" : "Zobrazit detail"}</span>}
            </div>
          </div>
          <div className="run-data"><strong>{run.distanceKm.toFixed(2)} km</strong><span>{formatDuration(run.durationSeconds)}</span></div>
          <div className="run-data"><strong>{formatPace(run.averagePaceSecondsPerKm)} /km</strong><span>tempo</span></div>
          {onDelete && (
            <button aria-label={`Odebrat běh ${run.title}`} className="delete-button" onClick={() => onDelete(run.id)}>
              <Icon name="trash" size={14} />
            </button>
          )}
      </div>
      {expandable && (
        <div className="run-detail" hidden={!expanded} id={detailId}>
          {expanded && (
            <>
              <div className="run-detail-summary">
                <div><span>Celková vzdálenost</span><strong>{run.distanceKm.toFixed(2)} km</strong></div>
                <div><span>Průměrné tempo</span><strong>{formatPace(run.averagePaceSecondsPerKm)} /km</strong></div>
                <div><span>Čas</span><strong>{formatDuration(run.durationSeconds)}</strong></div>
                <div><span>Převýšení</span><strong>{run.elevationM !== undefined ? `${Math.round(run.elevationM)} m` : "—"}</strong></div>
              </div>
              <div className="run-detail-charts">
                <section aria-label="Průběh tempa">
                  <h3>Tempo podle vzdálenosti</h3>
                  <LineChart runs={[run]} metric="pace" description="Průběh tempa podle vzdálenosti" color={color} />
                </section>
                <section aria-label="Výškový profil">
                  <h3>Výškový profil</h3>
                  <LineChart runs={[run]} metric="elevation" showElevationSummary={false} description="Nadmořská výška podle vzdálenosti" color={color} />
                </section>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
