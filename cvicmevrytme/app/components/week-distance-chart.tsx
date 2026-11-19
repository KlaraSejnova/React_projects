import type { Run } from "@/lib/runs";

export default function WeekDistanceChart({ runs, now }: { runs: Run[]; now: number }) {
  const currentWeek = new Date(now);
  currentWeek.setHours(0, 0, 0, 0);
  currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 6) % 7));
  const weeks = Array.from({ length: 5 }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (4 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const distance = runs
      .filter((run) => {
        const date = new Date(run.date);
        return date >= start && date < end;
      })
      .reduce((total, run) => total + run.distanceKm, 0);
    return {
      label: `${start.getDate()}. ${start.toLocaleDateString("cs-CZ", { month: "short" })}`,
      distance,
      current: index === 4,
    };
  });
  const maxDistance = Math.max(10, ...weeks.map((week) => week.distance));
  const thisWeek = weeks.at(-1)?.distance ?? 0;

  return (
    <>
      <div className="week-summary">
        <strong>{thisWeek.toFixed(1)} km</strong>
        <span>tento týden</span>
      </div>
      <div className="week-bars" aria-label="Uběhnuté kilometry za posledních pět týdnů">
        {weeks.map((week) => (
          <div className="week-column" key={week.label}>
            <div
              className={`week-bar${week.current ? " current" : ""}`}
              style={{ height: `${Math.max(4, (week.distance / maxDistance) * 100)}%` }}
              title={`${week.distance.toFixed(1)} km`}
            />
            <span>{week.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

