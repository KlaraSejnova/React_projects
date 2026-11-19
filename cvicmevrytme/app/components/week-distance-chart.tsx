import { useId, useState } from "react";
import type { Run } from "@/lib/runs";
import { getWeeklyDistances } from "@/lib/weekly-distance";

function formatWeekDate(date: Date) {
  return date.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}

function formatRunCount(count: number) {
  return `${count} ${count === 1 ? "běh" : count >= 2 && count <= 4 ? "běhy" : "běhů"}`;
}

export default function WeekDistanceChart({ runs, now }: { runs: Run[]; now: number }) {
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const detailId = useId();
  const weeks = getWeeklyDistances(runs, now);
  const selectedWeek = weeks.find((week) => week.start.getTime() === selectedStart);
  const maxDistance = Math.max(10, ...weeks.map((week) => week.distance));
  const thisWeek = weeks.at(-1)?.distance ?? 0;
  const selectedEnd = selectedWeek && new Date(selectedWeek.end);
  if (selectedEnd) selectedEnd.setDate(selectedEnd.getDate() - 1);

  return (
    <>
      <div className="week-summary">
        <strong>{thisWeek.toFixed(1)} km</strong>
        <span>tento týden</span>
      </div>
      <p className="week-hint">
        Kliknutím na týden zobrazíš jeho běhy.
        {selectedWeek?.current && " Fialový okraj označuje současný týden."}
      </p>
      <div className="week-bars" aria-label="Uběhnuté kilometry za posledních pět týdnů">
        {weeks.map((week) => {
          const start = week.start.getTime();
          const selected = start === selectedStart;
          return (
            <button
              aria-controls={detailId}
              aria-expanded={selected}
              aria-label={`Týden od ${formatWeekDate(week.start)}, ${week.distance.toFixed(1)} km, ${formatRunCount(week.runs.length)}${week.current ? ", současný týden" : ""}`}
              className="week-column"
              key={start}
              onClick={() => setSelectedStart(selected ? null : start)}
              type="button"
            >
              <div
                className={`week-bar${week.current ? " current" : ""}`}
                style={{ height: `${Math.max(4, (week.distance / maxDistance) * 100)}%` }}
              />
              <span>{week.start.getDate()}. {week.start.toLocaleDateString("cs-CZ", { month: "short" })}</span>
            </button>
          );
        })}
      </div>
      <div id={detailId} aria-live="polite">
        {selectedWeek && selectedEnd && (
          <div className="week-detail">
            <div className="week-detail-heading">
              <h3>{formatWeekDate(selectedWeek.start)} – {formatWeekDate(selectedEnd)}</h3>
              <span>{selectedWeek.distance.toFixed(1)} km · {formatRunCount(selectedWeek.runs.length)}</span>
            </div>
            {selectedWeek.runs.length ? (
              <ul className="week-detail-runs">
                {selectedWeek.runs.map((run) => (
                  <li key={run.id}>
                    <span><strong>{run.title}</strong><small>{formatWeekDate(new Date(run.date))}</small></span>
                    <strong>{run.distanceKm.toFixed(2)} km</strong>
                  </li>
                ))}
              </ul>
            ) : <p className="week-detail-empty">V tomto týdnu nemáš žádný zaznamenaný běh.</p>}
          </div>
        )}
      </div>
    </>
  );
}
