import type { CSSProperties } from "react";
import {
  days,
  routines,
  type CompletionState,
} from "@/app/data/dashboard-data";
import { OutlineIcon, RoutineIcon } from "@/app/components/Icons";

type RoutineGridProps = {
  todayKey: string;
  selectedDayKey: string;
  showMobileWeek: boolean;
  completed: CompletionState;
  onSelectDay: (dayKey: string) => void;
  onToggleMobileWeek: () => void;
  onToggleRoutine: (dayKey: string, routineId: string) => void;
};

function completionKey(day: string, routine: string) {
  return `${day}-${routine}`;
}

export default function RoutineGrid({
  todayKey,
  selectedDayKey,
  showMobileWeek,
  completed,
  onSelectDay,
  onToggleMobileWeek,
  onToggleRoutine,
}: RoutineGridProps) {
  const selectedDay = days.find((day) => day.key === selectedDayKey) ?? days[0];
  const selectedDayIndex = days.findIndex((day) => day.key === selectedDay.key);

  function moveSelectedDay(direction: -1 | 1) {
    const nextIndex =
      (selectedDayIndex + direction + days.length) % days.length;
    onSelectDay(days[nextIndex].key);
  }

  return (
    <>
      <section
        className={`mobile-day-view${showMobileWeek ? " mobile-week-mode" : ""}`}
        aria-label="Úkoly pro vybraný den"
      >
        <div className="mobile-day-controls">
          {!showMobileWeek && (
            <>
              <button
                type="button"
                className="week-arrow"
                onClick={() => moveSelectedDay(-1)}
                aria-label="Předchozí den"
              >
                <OutlineIcon>
                  <path d="m14 18-6-6 6-6" />
                </OutlineIcon>
              </button>
              <div className="mobile-day-heading">
                <span>{selectedDay.fullLabel}</span>
                {selectedDay.key === todayKey && <small>Dnes</small>}
              </div>
              <button
                type="button"
                className="week-arrow"
                onClick={() => moveSelectedDay(1)}
                aria-label="Následující den"
              >
                <OutlineIcon>
                  <path d="m10 18 6-6-6-6" />
                </OutlineIcon>
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          className="mobile-view-toggle"
          onClick={onToggleMobileWeek}
          aria-expanded={showMobileWeek}
        >
          {showMobileWeek ? "Zobrazit jeden den" : "Zobrazit celý týden"}
        </button>
        <div className="mobile-routine-list">
          {routines.map((routine) => {
            const key = completionKey(selectedDay.key, routine.id);
            const isCompleted = completed[key] ?? false;

            return (
              <label
                className={`mobile-routine available-cell${isCompleted ? " completed" : ""}`}
                style={{ "--routine-color": routine.color } as CSSProperties}
                key={routine.id}
              >
                <span className="routine-info">
                  <span className="routine-icon" aria-hidden="true">
                    <RoutineIcon name={routine.icon} />
                  </span>
                  <span>
                    <strong>{routine.name}</strong>
                    <small>{routine.detail}</small>
                  </span>
                </span>
                <span
                  className={`check-cell available-cell${isCompleted ? " completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() =>
                      onToggleRoutine(selectedDay.key, routine.id)
                    }
                    aria-label={`${routine.name}: ${selectedDay.fullLabel}`}
                  />
                  <span className="coin" aria-hidden="true">
                    <span className="coin-face coin-front">
                      <RoutineIcon name={routine.icon} />
                    </span>
                    <span
                      className="coin-face coin-back"
                      style={{ "--accent": routine.color } as CSSProperties}
                    >
                      <RoutineIcon name={routine.icon} />
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section
        className={`week-grid${showMobileWeek ? " mobile-week-visible" : ""}`}
        aria-label="Úkoly pro tento týden"
      >
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
                <RoutineIcon name={routine.icon} />
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
                  className={`check-cell${day.key === todayKey ? " current-day" : ""} available-cell`}
                  key={key}
                  title={`${routine.name}: ${day.fullLabel}`}
                >
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleRoutine(day.key, routine.id)}
                    aria-label={`${routine.name}: ${day.fullLabel}`}
                  />
                  <span className="coin" aria-hidden="true">
                    <span className="coin-face coin-front">
                      <RoutineIcon name={routine.icon} />
                    </span>
                    <span
                      className="coin-face coin-back"
                      style={{ "--accent": routine.color } as CSSProperties}
                    >
                      <RoutineIcon name={routine.icon} />
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ))}
      </section>
    </>
  );
}
