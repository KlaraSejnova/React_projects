"use client";

import { useSyncExternalStore } from "react";

const days = [
  { key: "mon", label: "Po", fullLabel: "Pondělí" },
  { key: "tue", label: "Út", fullLabel: "Úterý" },
  { key: "wed", label: "St", fullLabel: "Středa" },
  { key: "thu", label: "Čt", fullLabel: "Čtvrtek" },
  { key: "fri", label: "Pá", fullLabel: "Pátek" },
  { key: "sat", label: "So", fullLabel: "Sobota" },
  { key: "sun", label: "Ne", fullLabel: "Neděle" },
];

const routines = [
  { id: "teeth", icon: "🪥", name: "Vyčistit zuby", detail: "ráno a večer" },
  {
    id: "room",
    icon: "🧸",
    name: "Uklidit pokoj",
    detail: "hračky na své místo",
  },
  { id: "homework", icon: "✏️", name: "Domácí úkol", detail: "škola hotová" },
  { id: "kindness", icon: "🌞", name: "Pomoc doma", detail: "malá dobrá věc" },
];

type CompletionState = Record<string, boolean>;

function completionKey(day: string, routine: string) {
  return `${day}-${routine}`;
}

function subscribeToProgress(onStoreChange: () => void) {
  window.addEventListener("weekdashboard-progress-changed", onStoreChange);
  return () =>
    window.removeEventListener("weekdashboard-progress-changed", onStoreChange);
}

function getProgressSnapshot() {
  return window.localStorage.getItem("weekdashboard-progress") ?? "";
}

export default function Home() {
  const progressSnapshot = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    () => "",
  );
  const completed: CompletionState = progressSnapshot
    ? JSON.parse(progressSnapshot)
    : {};

  function toggleRoutine(day: string, routine: string) {
    const key = completionKey(day, routine);
    const nextProgress = { ...completed, [key]: !completed[key] };
    window.localStorage.setItem(
      "weekdashboard-progress",
      JSON.stringify(nextProgress),
    );
    window.dispatchEvent(new Event("weekdashboard-progress-changed"));
  }

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = days.length * routines.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <main className="dashboard-shell">
      <section className="dashboard" aria-labelledby="dashboard-title">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Můj týden</p>
            <h1 id="dashboard-title">Ahoj, Matýsku!</h1>
            <p className="intro">Každý hotový úkol je malá výhra.</p>
          </div>
          <div
            className="weekly-score"
            aria-label={`${completedCount} z ${totalCount} úkolů hotovo`}
          >
            <span>Hotovo</span>
            <strong>
              {completedCount}/{totalCount}
            </strong>
          </div>
        </header>

        <section className="progress-section" aria-label="Týdenní postup">
          <div className="progress-copy">
            <span>Týdenní postup</span>
            <strong>{progress} %</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="week-grid" aria-label="Úkoly pro tento týden">
          <div className="grid-corner" aria-hidden="true">
            Úkoly
          </div>
          {days.map((day) => (
            <div className="day-heading" key={day.key} title={day.fullLabel}>
              {day.label}
            </div>
          ))}

          {routines.map((routine) => (
            <div className="routine-row" key={routine.id}>
              <div className="routine-info">
                <span className="routine-icon" aria-hidden="true">
                  {routine.icon}
                </span>
                <span>
                  <strong>{routine.name}</strong>
                  <small>{routine.detail}</small>
                </span>
              </div>
              {days.map((day) => {
                const key = completionKey(day.key, routine.id);
                const isCompleted = completed[key] ?? false;

                return (
                  <label
                    className="check-cell"
                    key={key}
                    title={`${routine.name}: ${day.fullLabel}`}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleRoutine(day.key, routine.id)}
                      aria-label={`${routine.name}: ${day.fullLabel}`}
                    />
                    <span aria-hidden="true">{isCompleted ? "✓" : ""}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </section>

        <p className="footer-note">Dnes to jde skvěle. Jen tak dál!</p>
      </section>
    </main>
  );
}
