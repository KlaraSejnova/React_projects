"use client";

import { useState, useSyncExternalStore } from "react";

// Dny a jejich zkratky se používají jako hlavičky tabulky i jako klíče pro ukládání.
const days = [
  { key: "mon", label: "Po", fullLabel: "Pondělí" },
  { key: "tue", label: "Út", fullLabel: "Úterý" },
  { key: "wed", label: "St", fullLabel: "Středa" },
  { key: "thu", label: "Čt", fullLabel: "Čtvrtek" },
  { key: "fri", label: "Pá", fullLabel: "Pátek" },
  { key: "sat", label: "So", fullLabel: "Sobota" },
  { key: "sun", label: "Ne", fullLabel: "Neděle" },
];

// Seznam úkolů, které se v tabulce zobrazí. Čtení je dostupné pouze o víkendu.
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
  {
    id: "reading",
    icon: "📚",
    name: "Čtení",
    detail: "kniha nebo pohádka",
    weekendOnly: true,
  },
];

type CompletionState = Record<string, boolean>;

// Vytvoří jednoznačný klíč pro kombinaci dne a úkolu, například "mon-teeth".
function completionKey(day: string, routine: string) {
  return `${day}-${routine}`;
}

// Vrátí pondělí týdne. Offset -1 znamená minulý týden a 1 následující.
function getWeekStart(offset: number) {
  const date = new Date();
  const day = date.getDay();
  const daysFromMonday = (day + 6) % 7;

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysFromMonday + offset * 7);
  return date;
}

// Každý týden má vlastní klíč, takže se dokončené úkoly mezi týdny nemíchají.
function getProgressStorageKey(weekStart: Date) {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  return `weekdashboard-progress-${year}-${month}-${day}`;
}

// Připraví textový rozsah týdne podle českého formátu data.
function formatWeekLabel(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${formatter.format(weekStart)} – ${formatter.format(weekEnd)}`;
}

// Poslouchá vlastní událost, aby se komponenta překreslila po změně localStorage.
function subscribeToProgress(onStoreChange: () => void) {
  window.addEventListener("weekdashboard-progress-changed", onStoreChange);
  return () =>
    window.removeEventListener("weekdashboard-progress-changed", onStoreChange);
}

// useSyncExternalStore potřebuje funkci, která načte aktuální uložený stav.
function getProgressSnapshot(storageKey: string) {
  return window.localStorage.getItem(storageKey) ?? "";
}

// JavaScript vrací neděli jako 0, proto ji převádíme na poslední položku seznamu.
function getTodayKey() {
  return days[(new Date().getDay() + 6) % 7].key;
}

export default function Home() {
  // Offset určuje, jestli prohlížíme minulý, aktuální, nebo následující týden.
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getWeekStart(weekOffset);
  const progressStorageKey = getProgressStorageKey(weekStart);

  // Stav checkboxů je uložený v prohlížeči, aby zůstal zachovaný po obnovení stránky.
  const progressSnapshot = useSyncExternalStore(
    subscribeToProgress,
    () => getProgressSnapshot(progressStorageKey),
    () => "",
  );
  const completed: CompletionState = progressSnapshot
    ? JSON.parse(progressSnapshot)
    : {};

  // Dnešní den zvýrazňujeme jen při prohlížení aktuálního týdne.
  const todayKey = weekOffset === 0 ? getTodayKey() : "";

  // Přepne jeden úkol a oznámí ostatním odběratelům, že se stav změnil.
  function toggleRoutine(day: string, routine: string) {
    const key = completionKey(day, routine);
    const nextProgress = { ...completed, [key]: !completed[key] };
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify(nextProgress),
    );
    window.dispatchEvent(new Event("weekdashboard-progress-changed"));
  }

  // Týdenní statistika počítá všechny dokončené úkoly v právě otevřeném týdnu.
  const completedCount = Object.values(completed).filter(Boolean).length;

  // Povzbudivou větu zobrazíme až po dokončení alespoň dvou dnešních úkolů.
  const completedTodayCount = todayKey
    ? routines.filter(
        (routine) => completed[completionKey(todayKey, routine.id)],
      ).length
    : 0;
  const totalCount = days.length * (routines.length - 1) + 2;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <main className="dashboard-shell">
      <section className="dashboard" aria-labelledby="dashboard-title">
        {/* Záhlaví obsahuje název aplikace, pozdrav, přepínání týdne a skóre. */}
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Můj týden</p>
            <h1 id="dashboard-title">Ahoj, Matýsku!</h1>
            <p className="intro">Každý hotový úkol je malá výhra.</p>
            <div className="week-controls" aria-label="Přepínání týdne">
              <button
                type="button"
                className="week-arrow"
                onClick={() => setWeekOffset((offset) => offset - 1)}
                aria-label="Předchozí týden"
              >
                ←
              </button>
              <span className="week-label">{formatWeekLabel(weekStart)}</span>
              <button
                type="button"
                className="week-arrow"
                onClick={() => setWeekOffset((offset) => offset + 1)}
                aria-label="Následující týden"
              >
                →
              </button>
            </div>
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

        {/* Lišta ukazuje poměr dokončených úkolů za celý týden. */}
        <section className="progress-section" aria-label="Týdenní postup">
          <div className="progress-copy">
            <span>Týdenní postup</span>
            <strong>{progress} %</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

        {/* Tabulka vzniká ze seznamu dnů a seznamu úkolů definovaných nahoře. */}
        <section className="week-grid" aria-label="Úkoly pro tento týden">
          <div className="grid-corner" aria-hidden="true">
            Úkoly
          </div>
          {days.map((day) => (
            <div
              className={`day-heading${day.key === todayKey ? " current-day" : ""}`}
              key={day.key}
              title={day.fullLabel}
            >
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
                // Každé políčko tabulky má vlastní stav a pravidla dostupnosti.
                const key = completionKey(day.key, routine.id);
                const isCompleted = completed[key] ?? false;
                const isAvailable = routine.weekendOnly
                  ? day.key === "sat" || day.key === "sun"
                  : weekOffset === 0 && day.key === todayKey;

                return (
                  <label
                    className={`check-cell${day.key === todayKey ? " current-day" : ""}${isAvailable ? " available-cell" : ""}`}
                    key={key}
                    title={`${routine.name}: ${day.fullLabel}`}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      disabled={!isAvailable}
                      onChange={() => toggleRoutine(day.key, routine.id)}
                      aria-label={`${routine.name}: ${day.fullLabel}`}
                    />
                    {(!routine.weekendOnly || isAvailable) && (
                      <span aria-hidden="true">{isCompleted ? "✓" : ""}</span>
                    )}
                  </label>
                );
              })}
            </div>
          ))}
        </section>

        {completedTodayCount >= 2 && (
          <p className="footer-note">Dnes to jde skvěle. Jen tak dál!</p>
        )}
      </section>
    </main>
  );
}
