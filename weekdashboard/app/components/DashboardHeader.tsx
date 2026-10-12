import { OutlineIcon } from "@/app/components/Icons";

type DashboardHeaderProps = {
  vocative: string;
  weekLabel: string;
  completedCount: number;
  totalCount: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onSignOut: () => void;
};

export default function DashboardHeader({
  vocative,
  weekLabel,
  completedCount,
  totalCount,
  onPreviousWeek,
  onNextWeek,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Můj týden</p>
        <h1 id="dashboard-title">Ahoj, {vocative}!</h1>
        <p className="intro">Každý hotový úkol je malá výhra.</p>
        <div className="week-controls" aria-label="Přepínání týdne">
          <button
            type="button"
            className="week-arrow"
            onClick={onPreviousWeek}
            aria-label="Předchozí týden"
          >
            <OutlineIcon>
              <path d="m14 18-6-6 6-6" />
            </OutlineIcon>
          </button>
          <span className="week-label">{weekLabel}</span>
          <button
            type="button"
            className="week-arrow"
            onClick={onNextWeek}
            aria-label="Následující týden"
          >
            <OutlineIcon>
              <path d="m10 18 6-6-6-6" />
            </OutlineIcon>
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
      <button type="button" className="sign-out-button" onClick={onSignOut}>
        Odhlásit se
      </button>
    </header>
  );
}
