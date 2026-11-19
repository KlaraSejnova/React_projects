import { useId, useLayoutEffect, useRef, useState } from "react";
import type { Run } from "@/lib/runs";
import { getWeeklyDistances } from "@/lib/weekly-distance";

function formatWeekDate(date: Date) {
  return date.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}

function formatRunCount(count: number) {
  return `${count} ${count === 1 ? "běh" : count >= 2 && count <= 4 ? "běhy" : "běhů"}`;
}

export default function WeekDistanceChart({ runs, now, cutoff }: { runs: Run[]; now: number; cutoff: number | null }) {
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [pageOffset, setPageOffset] = useState(0);
  const detailId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { weeks, maxDistance, thisWeek, page, pageCount, undatedCount } = getWeeklyDistances(runs, now, cutoff, pageOffset);
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollLeft = scroll.scrollWidth;
  }, [page, weeks.length]);
  const selectedWeek = weeks.find((week) => week.start.getTime() === selectedStart);
  const selectedEnd = selectedWeek && new Date(selectedWeek.end);
  if (selectedEnd) selectedEnd.setDate(selectedEnd.getDate() - 1);

  return (
    <>
      <div className="week-summary">
        <strong>{thisWeek.toFixed(1)} km</strong>
        <span>tento týden</span>
      </div>
      {weeks.length > 0 && (
        <p className="week-hint">
          Zobrazené jsou jen týdny s běhy. Graf lze posouvat do stran. Kliknutím na týden zobrazíš jeho běhy.
          {selectedWeek?.current && " Fialový okraj označuje současný týden."}
        </p>
      )}
      {pageCount > 1 && (
        <div className="week-page-controls" aria-label="Procházení historie týdnů">
          <button className="secondary-button" disabled={page === pageCount - 1} onClick={() => { setSelectedStart(null); setPageOffset(page + 1); }} type="button">Starší týdny</button>
          <span>{formatWeekDate(weeks[0].start)} – {formatWeekDate(weeks[weeks.length - 1].start)}</span>
          <button className="secondary-button" disabled={page === 0} onClick={() => { setSelectedStart(null); setPageOffset(page - 1); }} type="button">Novější týdny</button>
        </div>
      )}
      {undatedCount > 0 && <p className="week-hint" role="status">U {undatedCount} běhů nelze určit datum, proto nejsou v grafu.</p>}
      {weeks.length > 0 ? (
        <div className="week-scroll" ref={scrollRef} role="region" aria-label="Týdenní kilometry za vybrané období, vodorovně posuvný graf" tabIndex={0}>
          <div className="week-bars">
            {weeks.map((week) => {
              const start = week.start.getTime();
              const selected = start === selectedStart;
              return (
                <button
                  aria-controls={detailId}
                  aria-expanded={selected}
                  aria-label={`Týden od ${formatWeekDate(week.start)}, ${week.distance.toFixed(1)} km, ${formatRunCount(week.runs.length)}${week.current ? ", současný týden" : ""}${week.partial ? ", část týdne ve vybraném období" : ""}`}
                  className="week-column"
                  key={start}
                  onClick={() => setSelectedStart(selected ? null : start)}
                  type="button"
                >
                  <div
                    className={`week-bar${week.current ? " current" : ""}`}
                    style={{ height: `${Math.max(4, (week.distance / maxDistance) * 100)}%` }}
                  />
                  <span>{week.start.getDate()}. {week.start.toLocaleDateString("cs-CZ", { month: "short" })} {week.start.getFullYear()}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : <p className="week-detail-empty">Ve vybraném období nejsou žádné běhy s platným datem.</p>}
      <div id={detailId} aria-live="polite">
        {selectedWeek && selectedEnd && (
          <div className="week-detail">
            <div className="week-detail-heading">
              <h3>{formatWeekDate(selectedWeek.start)} – {formatWeekDate(selectedEnd)}</h3>
              <span>{selectedWeek.distance.toFixed(1)} km · {formatRunCount(selectedWeek.runs.length)}</span>
            </div>
            {selectedWeek.partial && cutoff !== null && (
              <p className="week-detail-empty">
                Zobrazeny jsou jen běhy od {new Date(cutoff).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}, kdy začíná vybrané období.
              </p>
            )}
            <ul className="week-detail-runs">
              {selectedWeek.runs.map((run) => (
                <li key={run.id}>
                  <span><strong>{run.title}</strong><small>{formatWeekDate(new Date(run.date))}</small></span>
                  <strong>{run.distanceKm.toFixed(2)} km</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
