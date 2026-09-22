"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import { supabase } from "../lib/supabase";

const users = [
  { id: "barca", name: "Barča", vocative: "Barčo" },
  { id: "terka", name: "Terka", vocative: "Terko" },
  { id: "tester", name: "Tester", vocative: "Testere" },
];

const days = [
  { key: "mon", label: "Po", fullLabel: "Pondělí" },
  { key: "tue", label: "Út", fullLabel: "Úterý" },
  { key: "wed", label: "St", fullLabel: "Středa" },
  { key: "thu", label: "Čt", fullLabel: "Čtvrtek" },
  { key: "fri", label: "Pá", fullLabel: "Pátek" },
  { key: "sat", label: "So", fullLabel: "Sobota" },
  { key: "sun", label: "Ne", fullLabel: "Neděle" },
];

function OutlineIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const routines = [
  {
    id: "teeth",
    name: "Vyčistit zuby",
    detail: "ráno a večer",
    color: "#3aa0d1",
    icon: (
      <OutlineIcon>
        <path d="M12 3c-2.2 0-3.3 1.1-5 1.1C5.3 4.1 4 5.6 4 7.6c0 2.1.9 4.5 1.6 6.8.6 2 1 4.2 1.9 5.7.5.9 1.2 1.4 1.9 1.4.9 0 1.3-1.1 1.6-2.4.3-1.2.5-2.5 1-2.5s.7 1.3 1 2.5c.3 1.3.7 2.4 1.6 2.4.7 0 1.4-.5 1.9-1.4.9-1.5 1.3-3.7 1.9-5.7.7-2.3 1.6-4.7 1.6-6.8 0-2-1.3-3.5-3-3.5-1.7 0-2.8-1.1-5-1.1z" />
      </OutlineIcon>
    ),
  },
  {
    id: "room",
    name: "Uklidit pokoj",
    detail: "hračky na své místo",
    color: "#e08a3e",
    icon: (
      <OutlineIcon>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </OutlineIcon>
    ),
  },
  {
    id: "homework",
    name: "Domácí úkol",
    detail: "škola hotová",
    color: "#8b6fd1",
    icon: (
      <OutlineIcon>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </OutlineIcon>
    ),
  },
  {
    id: "kindness",
    name: "Pomoc doma",
    detail: "malá dobrá věc",
    color: "#d75d7a",
    icon: (
      <OutlineIcon>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </OutlineIcon>
    ),
  },
  {
    id: "reading",
    name: "Čtení",
    detail: "kniha nebo pohádka",
    weekendOnly: true,
    color: "#f2a6d5",
    icon: (
      <OutlineIcon>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16" />
        <path d="M8 7h8" />
      </OutlineIcon>
    ),
  },
];

type CompletionState = Record<string, boolean>;

type DashboardProfile = {
  id: string;
  name: string;
  vocative: string;
};

type DashboardRoutine = {
  id: string;
  name: string;
  detail: string | null;
  color: string;
  weekend_only: boolean;
  position: number;
};

function completionKey(day: string, routine: string) {
  return `${day}-${routine}`;
}

function getWeekStart(offset: number) {
  const date = new Date();
  const day = date.getDay();
  const daysFromMonday = (day + 6) % 7;

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysFromMonday + offset * 7);
  return date;
}

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

function progressStorageKey(userId: string, weekStart: Date) {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  return `weekdashboard-progress-${userId}-${year}-${month}-${day}`;
}

function getTodayKey() {
  return days[(new Date().getDay() + 6) % 7].key;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function Home() {
  const [activeUser, setActiveUser] = useState(users[0].id);
  const [weekOffset, setWeekOffset] = useState(0);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [profiles, setProfiles] = useState<DashboardProfile[]>([]);
  const [databaseRoutines, setDatabaseRoutines] = useState<DashboardRoutine[]>(
    [],
  );
  const [completed, setCompleted] = useState<CompletionState>({});
  const client = supabase;
  const weekStart = getWeekStart(weekOffset);
  const storageKey = progressStorageKey(activeUser, weekStart);
  const currentUser =
    profiles.find((user) => user.id === activeUser) ??
    users.find((user) => user.id === activeUser) ??
    users[0];
  const isTester = currentUser.name === "Tester";
  const todayKey = weekOffset === 0 ? getTodayKey() : "";
  const [dismissedRewardKey, setDismissedRewardKey] = useState("");

  useEffect(() => {
    const databaseClient = client;
    if (!databaseClient) {
      const saved = window.localStorage.getItem(storageKey);
      window.setTimeout(() => setCompleted(saved ? JSON.parse(saved) : {}), 0);
      return;
    }
    const requiredClient = databaseClient;

    let cancelled = false;
    async function loadSession() {
      const { data } = await requiredClient.auth.getSession();
      if (!cancelled) {
        setAuthenticatedUserId(data.session?.user.id ?? null);
      }
      setIsLoading(false);
    }

    void loadSession();
    const { data } = requiredClient.auth.onAuthStateChange((_event, session) => {
      setAuthenticatedUserId(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [client, storageKey]);

  useEffect(() => {
    const databaseClient = client!;
    if (!databaseClient || !authenticatedUserId) return;

    let cancelled = false;
    async function loadDashboardData() {
      const [profilesResult, routinesResult] = await Promise.all([
        databaseClient
          .from("dashboard_profiles")
          .select("id, name, vocative")
          .eq("owner_id", authenticatedUserId)
          .order("created_at"),
        databaseClient
          .from("dashboard_routines")
          .select("id, name, detail, color, weekend_only, position")
          .eq("owner_id", authenticatedUserId)
          .order("position"),
      ]);

      if (profilesResult.error || routinesResult.error) {
        setAuthError("Data se nepodařilo načíst ze Supabase.");
        return;
      }

      let loadedProfiles = (profilesResult.data ?? []) as DashboardProfile[];
      let loadedRoutines = (routinesResult.data ?? []) as DashboardRoutine[];

      if (loadedProfiles.length === 0) {
        const { data } = await databaseClient
          .from("dashboard_profiles")
          .insert(
            users.map(({ name, vocative }) => ({
              owner_id: authenticatedUserId,
              name,
              vocative,
            })),
          )
          .select("id, name, vocative");
        loadedProfiles = (data ?? []) as DashboardProfile[];
      }

      if (loadedRoutines.length === 0) {
        const { data } = await databaseClient
          .from("dashboard_routines")
          .insert(
            routines.map((routine, position) => ({
              owner_id: authenticatedUserId,
              name: routine.name,
              detail: routine.detail,
              color: routine.color,
              weekend_only: routine.weekendOnly ?? false,
              position,
            })),
          )
          .select("id, name, detail, color, weekend_only, position");
        loadedRoutines = (data ?? []) as DashboardRoutine[];
      }

      if (!cancelled) {
        setProfiles(loadedProfiles);
        setDatabaseRoutines(loadedRoutines);
        if (loadedProfiles[0]) setActiveUser(loadedProfiles[0].id);
      }
    }

    void loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [authenticatedUserId, client]);

  useEffect(() => {
    const databaseClient = client!;
    if (!databaseClient || !authenticatedUserId || !profiles.length) return;
    const profile = profiles.find((item) => item.id === activeUser);
    if (!profile) return;
    const profileId = profile.id;

    async function loadCompletions() {
      const { data: week, error: weekError } = await databaseClient
        .from("dashboard_weeks")
        .upsert(
          {
            owner_id: authenticatedUserId,
            week_start: toDateKey(weekStart),
          },
          { onConflict: "owner_id,week_start" },
        )
        .select("id")
        .single();

      if (weekError || !week) return;
      const { data } = await databaseClient
        .from("dashboard_completions")
        .select("routine_id, day, completed")
        .eq("owner_id", authenticatedUserId)
        .eq("profile_id", profileId)
        .eq("week_id", week.id);

      const next: CompletionState = {};
      for (const completion of data ?? []) {
        const routine = databaseRoutines.find(
          (item) => item.id === completion.routine_id,
        );
        const completionDate = new Date(`${completion.day}T12:00:00`);
        const day = days[(completionDate.getDay() + 6) % 7];
        if (routine && day) {
          next[completionKey(day.key, routine.name)] = completion.completed;
        }
      }
      setCompleted(next);
    }

    void loadCompletions();
  }, [activeUser, authenticatedUserId, client, databaseRoutines, profiles, weekStart]);

  async function toggleRoutine(day: string, routine: string) {
    const visualRoutine = routines.find((item) => item.id === routine);
    const routineName = visualRoutine?.name ?? routine;
    const key = completionKey(day, client ? routineName : routine);
    const nextValue = !completed[key];
    setCompleted((current) => ({ ...current, [key]: nextValue }));

    const databaseClient = client!;
    if (!databaseClient || !authenticatedUserId) {
      const nextProgress = { ...completed, [key]: nextValue };
      window.localStorage.setItem(storageKey, JSON.stringify(nextProgress));
      return;
    }

    const profile = profiles.find((item) => item.id === activeUser);
    const databaseRoutine = databaseRoutines.find(
      (item) => item.name === routineName,
    );
    const dayIndex = days.findIndex((item) => item.key === day);
    if (!profile || !databaseRoutine || dayIndex < 0) return;

    const completionDate = new Date(weekStart);
    completionDate.setDate(completionDate.getDate() + dayIndex);
    const { data: week } = await databaseClient
      .from("dashboard_weeks")
      .upsert(
        {
          owner_id: authenticatedUserId,
          week_start: toDateKey(weekStart),
        },
        { onConflict: "owner_id,week_start" },
      )
      .select("id")
      .single();

    if (!week) return;
    await databaseClient.from("dashboard_completions").upsert(
      {
        owner_id: authenticatedUserId,
        week_id: week.id,
        profile_id: profile.id,
        routine_id: databaseRoutine.id,
        day: toDateKey(completionDate),
        completed: nextValue,
      },
      { onConflict: "profile_id,week_id,routine_id,day" },
    );
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setAuthError("");
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError("Přihlášení se nepodařilo. Zkontroluj údaje.");
  }

  if (isLoading) {
    return <main className="dashboard-shell" aria-busy="true" />;
  }

  if (supabase && !authenticatedUserId) {
    return (
      <main className="dashboard-shell">
        <section className="dashboard auth-panel" aria-labelledby="login-title">
          <p className="eyebrow">Můj týden</p>
          <h1 id="login-title">Přihlášení</h1>
          <p className="intro">Přihlas se pro načtení svých týdnů a úkolů.</p>
          <form className="auth-form" onSubmit={signIn}>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Heslo
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {authError && <p role="alert">{authError}</p>}
            <button type="submit" className="reward-modal-button">
              Přihlásit se
            </button>
          </form>
        </section>
      </main>
    );
  }

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = isTester
    ? days.length * routines.length
    : days.length * (routines.length - 1) + 2;
  const progress = Math.round((completedCount / totalCount) * 100);
  const completedTodayCount = todayKey
    ? routines.filter(
        (routine) =>
          completed[completionKey(todayKey, client ? routine.name : routine.id)],
      ).length
    : 0;
  const rewardKey = `${activeUser}-${weekOffset}`;
  const showRewardModal = progress >= 75 && dismissedRewardKey !== rewardKey;

  return (
    <main className="dashboard-shell">
      {showRewardModal && (
        <div className="reward-modal-backdrop">
          <section
            className="reward-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-modal-title"
          >
            <span className="reward-modal-star" aria-hidden="true">
              ★
            </span>
            <p className="eyebrow">Malá odměna</p>
            <h2 id="reward-modal-title">Skvělá práce, {currentUser.name}!</h2>
            <p>
              Máš hotovo {progress} %. Běž si říct o odměnu, zasloužíš si ji!
            </p>
            <button
              type="button"
              className="reward-modal-button"
              onClick={() => setDismissedRewardKey(rewardKey)}
            >
              Super, děkuju!
            </button>
          </section>
        </div>
      )}
      <section className="dashboard" aria-labelledby="dashboard-title">
        <div className="user-switcher" role="tablist" aria-label="Vyber dítě">
          {(profiles.length ? profiles : users).map((user) => (
            <button
              key={user.id}
              type="button"
              role="tab"
              aria-selected={user.id === activeUser}
              className={`user-tab${user.id === activeUser ? " active" : ""}`}
              onClick={() => setActiveUser(user.id)}
            >
              {user.name}
            </button>
          ))}
        </div>

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Můj týden</p>
            <h1 id="dashboard-title">Ahoj, {currentUser.vocative}!</h1>
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
                const key = completionKey(
                  day.key,
                  client ? routine.name : routine.id,
                );
                const isCompleted = completed[key] ?? false;
                const isAvailable = isTester
                  ? true
                  : routine.weekendOnly
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
                      <span className="coin" aria-hidden="true">
                        <span className="coin-face coin-front">
                          {routine.icon}
                        </span>
                        <span
                          className="coin-face coin-back"
                          style={{ "--accent": routine.color } as CSSProperties}
                        >
                          {routine.icon}
                        </span>
                      </span>
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
