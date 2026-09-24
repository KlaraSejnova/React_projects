"use client";
// Hlavní stránka aplikace: přihlášení profilu a týdenní přehled dětských úkolů.

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import { supabase } from "../lib/supabase";

// Profily, mezi kterými se lze přihlásit. "tester" obchází Supabase přihlášení.
const users = [
  { id: "barca", name: "Barča", vocative: "Barčo" },
  { id: "terka", name: "Terka", vocative: "Terko" },
  { id: "tester", name: "Tester", vocative: "Testere" },
];

// Dny týdne používané jako sloupce tabulky i jako klíče pro ukládání stavu.
const days = [
  { key: "mon", label: "Po", fullLabel: "Pondělí" },
  { key: "tue", label: "Út", fullLabel: "Úterý" },
  { key: "wed", label: "St", fullLabel: "Středa" },
  { key: "thu", label: "Čt", fullLabel: "Čtvrtek" },
  { key: "fri", label: "Pá", fullLabel: "Pátek" },
  { key: "sat", label: "So", fullLabel: "Sobota" },
  { key: "sun", label: "Ne", fullLabel: "Neděle" },
];

// Obalí SVG cestu do jednotného stylu ikon (stejná velikost, tloušťka čáry).
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

// Seznam denních úkolů (barva a ikona se používají i v mobilním zobrazení).
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

// Stav dokončení jednoho úkolu v jednom dni, klíčovaný pomocí completionKey.
type CompletionState = Record<string, boolean>;

// Klíč pro "tester" profil (bez Supabase) a klíč pro přihlášeného Supabase uživatele.
const userStorageKey = "weekdashboard-user";
const authProfileStorageKey = "weekdashboard-auth-profile";

// Přečte uloženého testera z localStorage; mimo prohlížeč (SSR) vrátí null.
function getStoredUser() {
  if (typeof window === "undefined") return null;
  const savedUser = window.localStorage.getItem(userStorageKey);
  return users.some((user) => user.id === savedUser) ? savedUser : null;
}

// Umožňuje useSyncExternalStore reagovat na přihlášení/odhlášení testera v jiném tabu.
function subscribeToStoredUser(onChange: () => void) {
  window.addEventListener("weekdashboard-user-change", onChange);
  return () =>
    window.removeEventListener("weekdashboard-user-change", onChange);
}

// Vytvoří jednoznačný klíč pro kombinaci dne a úkolu, např. "mon-teeth".
function completionKey(day: string, routine: string) {
  return `${day}-${routine}`;
}

// Vrátí pondělí týdne posunutého o offset týdnů (offset 0 = aktuální týden).
function getWeekStart(offset: number) {
  const date = new Date();
  const day = date.getDay();
  const daysFromMonday = (day + 6) % 7;

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysFromMonday + offset * 7);
  return date;
}

// Zformátuje rozsah týdne (pondělí–neděle) do čitelného českého textu.
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

// Postup se ukládá zvlášť pro každého uživatele a pro každý týden.
function progressStorageKey(userId: string, weekStart: Date) {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  return `weekdashboard-progress-${userId}-${year}-${month}-${day}`;
}

function weekDateKey(weekStart: Date) {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// JavaScript vrací neděli jako 0, proto ji převádíme na poslední den v poli days.
function getTodayKey() {
  return days[(new Date().getDay() + 6) % 7].key;
}

export default function Home() {
  // Tester profil žije jen v localStorage, ostatní profily jsou přihlášené přes Supabase.
  const localUser = useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUser,
    () => null,
  );
  const [authProfile, setAuthProfile] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  // Dokud nevíme, jestli je Supabase session platná, nezobrazujeme obsah (kvůli blikání).
  const [authReady, setAuthReady] = useState(!supabase);
  // Profil vybraný na přihlašovací obrazovce, než uživatel zadá email a heslo.
  const [loginProfile, setLoginProfile] = useState<"barca" | "terka" | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // Offset určuje, jestli prohlížíme minulý, aktuální, nebo následující týden.
  const [weekOffset, setWeekOffset] = useState(0);
  // Vybraný den v mobilním zobrazení jednoho dne.
  const [selectedDayKey, setSelectedDayKey] = useState(getTodayKey());
  const [showMobileWeek, setShowMobileWeek] = useState(false);
  const [completed, setCompleted] = useState<CompletionState>({});
  // Tester nepotřebuje Supabase přihlášení, ostatní profily ano.
  const activeUser = localUser === "tester" ? localUser : authProfile;
  const weekStart = getWeekStart(weekOffset);
  const currentWeekDate = weekDateKey(weekStart);
  const storageKey = progressStorageKey(activeUser ?? "guest", weekStart);
  const todayKey = weekOffset === 0 ? getTodayKey() : "";
  const selectedDay = days.find((day) => day.key === selectedDayKey) ?? days[0];
  // Klíč odmítnuté odměny za aktuální týden, aby se modál znovu neukazoval po zavření.
  const [dismissedRewardKey, setDismissedRewardKey] = useState("");

  // Při načtení stránky zjistí, jestli je uživatel přihlášený přes Supabase,
  // a dál sleduje odhlášení (např. z jiné záložky).
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const savedProfile = window.localStorage.getItem(authProfileStorageKey);
      setAuthUserId(data.session?.user.id ?? null);
      setAuthProfile(
        data.session && (savedProfile === "barca" || savedProfile === "terka")
          ? savedProfile
          : null,
      );
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthUserId(session?.user.id ?? null);
        if (!session) {
          setAuthProfile(null);
          window.localStorage.removeItem(authProfileStorageKey);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Po přihlášení nebo změně týdne načte postup z cloudu, případně z lokální zálohy.
  useEffect(() => {
    if (!activeUser) return;
    const saved = window.localStorage.getItem(storageKey);
    const timeoutId = window.setTimeout(
      () => setCompleted(saved ? JSON.parse(saved) : {}),
      0,
    );

    if (!authUserId || !supabase) {
      return () => window.clearTimeout(timeoutId);
    }

    const client = supabase;
    let cancelled = false;
    const loadCloudProgress = async () => {
      const { data, error } = await client
        .from("dashboard_progress")
        .select("completion_key, completed")
        .eq("owner_id", authUserId)
        .eq("week_start", currentWeekDate);

      if (cancelled || error) return;

      const localProgress = saved ? JSON.parse(saved) : {};
      if (data.length === 0 && Object.keys(localProgress).length > 0) {
        const rows = Object.entries(localProgress).map(
          ([completionKey, completed]) => ({
            owner_id: authUserId,
            week_start: currentWeekDate,
            completion_key: completionKey,
            completed: Boolean(completed),
          }),
        );
        const { error: migrationError } = await client
          .from("dashboard_progress")
          .upsert(rows, {
            onConflict: "owner_id,week_start,completion_key",
          });
        if (!migrationError && !cancelled) {
          setCompleted(localProgress);
        }
        return;
      }

      const cloudProgress = Object.fromEntries(
        data
          .filter((row) => row.completed)
          .map((row) => [row.completion_key, true]),
      );
      setCompleted(cloudProgress);
      window.localStorage.setItem(storageKey, JSON.stringify(cloudProgress));
    };

    void loadCloudProgress();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeUser, authUserId, currentWeekDate, storageKey]);

  // Přihlásí zkušební profil bez Supabase, jen uloží značku do localStorage.
  function signInTester() {
    window.localStorage.setItem(userStorageKey, "tester");
    window.dispatchEvent(new Event("weekdashboard-user-change"));
  }

  // Ověří email a heslo přes Supabase a zkontroluje, že účet patří k vybranému profilu.
  async function signInAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginProfile) return;

    if (!supabase) {
      setLoginError("Přihlášení není na této verzi aplikace nastavené.");
      return;
    }

    setLoginError("");
    if (!email.trim() || !password) {
      setLoginError("Vyplň email i heslo.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        setLoginError("Email nebo heslo není správně.");
        return;
      }

      const accountProfile = data.user.user_metadata?.profile;
      if (accountProfile !== loginProfile) {
        await supabase.auth.signOut();
        setLoginError("Tento účet není přiřazený k vybranému profilu.");
        return;
      }

      window.localStorage.setItem(authProfileStorageKey, loginProfile);
      setAuthProfile(loginProfile);
    } catch {
      setLoginError("Přihlášení se nepodařilo. Zkus to prosím znovu.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  // Odhlásí testera z localStorage, nebo skutečného uživatele ze Supabase.
  function signOut() {
    if (localUser === "tester") {
      window.localStorage.removeItem(userStorageKey);
      window.dispatchEvent(new Event("weekdashboard-user-change"));
      return;
    }
    void supabase?.auth.signOut();
  }

  const currentUser = users.find((user) => user.id === activeUser);
  // Zatímco ověřujeme Supabase session, nic nevykreslujeme (prázdná stránka).
  if (!authReady) {
    return <main className="login-shell" aria-busy="true" />;
  }
  // Bez přihlášeného uživatele zobrazíme obrazovku výběru profilu a přihlašovací formulář.
  if (!currentUser) {
    return (
      <main className="login-shell">
        <section className="login-panel" aria-labelledby="login-title">
          <p className="eyebrow">Můj týden</p>
          <h1 id="login-title">Kdo se dnes přihlašuje?</h1>
          <p className="login-intro">
            Vyber svůj profil a otevři si svůj týden.
          </p>
          {!loginProfile ? (
            <div className="login-options">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`login-option login-option-${user.id}`}
                  onClick={() =>
                    user.id === "tester"
                      ? signInTester()
                      : setLoginProfile(user.id as "barca" | "terka")
                  }
                >
                  <span>{user.name}</span>
                  <small>
                    {user.id === "tester"
                      ? "pro vyzkoušení aplikace"
                      : "přihlášení emailem a heslem"}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <form className="login-form" onSubmit={signInAccount} noValidate>
              <p className="login-selected">
                Přihlašuješ se jako{" "}
                {loginProfile === "barca" ? "Barča" : "Terka"}
              </p>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                Heslo
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {loginError && <p className="login-error">{loginError}</p>}
              <button
                type="submit"
                className="login-submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Přihlašuji…" : "Přihlásit se"}
              </button>
              <button
                type="button"
                className="login-back"
                onClick={() => setLoginProfile(null)}
              >
                Zpět k výběru
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  // Tester má všechny dny odemčené, ostatní profily mohou odškrtávat jen dnešní den.
  const isTester = currentUser.name === "Tester";

  // Přepne jeden úkol a uloží nový stav lokálně i do cloudu pro přihlášený účet.
  async function toggleRoutine(day: string, routine: string) {
    const key = completionKey(day, routine);
    const nextValue = !completed[key];
    setCompleted((current) => ({ ...current, [key]: nextValue }));
    const nextProgress = { ...completed, [key]: nextValue };
    window.localStorage.setItem(storageKey, JSON.stringify(nextProgress));

    if (authUserId && supabase) {
      const { error } = await supabase.from("dashboard_progress").upsert(
        {
          owner_id: authUserId,
          week_start: currentWeekDate,
          completion_key: key,
          completed: nextValue,
        },
        { onConflict: "owner_id,week_start,completion_key" },
      );

      if (error) {
        console.error("Nepodařilo se uložit postup do cloudu.", error);
      }
    }
  }

  // Souhrnná procentuální hodnota postupu za celý zobrazený týden.
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = days.length * routines.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  // Počet dnes dokončených úkolů, používá se pro povzbudivou hlášku pod tabulkou.
  const completedTodayCount = todayKey
    ? routines.filter(
        (routine) => completed[completionKey(todayKey, routine.id)],
      ).length
    : 0;
  // Modál s odměnou se zobrazí jen jednou za týden, dokud ho uživatel nezavře.
  const rewardKey = `${activeUser}-${weekOffset}`;
  const showRewardModal = progress >= 75 && dismissedRewardKey !== rewardKey;

  return (
    <main className="dashboard-shell">
      {/* Modál s malou odměnou, zobrazí se po dosažení 75 % postupu v týdnu. */}
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
        {/* Záhlaví: pozdrav, přepínání týdne, souhrn a tlačítko odhlášení. */}
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
                <OutlineIcon>
                  <path d="m14 18-6-6 6-6" />
                </OutlineIcon>
              </button>
              <span className="week-label">{formatWeekLabel(weekStart)}</span>
              <button
                type="button"
                className="week-arrow"
                onClick={() => setWeekOffset((offset) => offset + 1)}
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
          <button type="button" className="sign-out-button" onClick={signOut}>
            Odhlásit se
          </button>
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

        {/* Mobilní zobrazení jednoho dne, na širších obrazovkách skryté přes CSS. */}
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
                  onClick={() => {
                    const index = days.findIndex(
                      (day) => day.key === selectedDayKey,
                    );
                    setSelectedDayKey(
                      days[(index + days.length - 1) % days.length].key,
                    );
                  }}
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
                  onClick={() => {
                    const index = days.findIndex(
                      (day) => day.key === selectedDayKey,
                    );
                    setSelectedDayKey(days[(index + 1) % days.length].key);
                  }}
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
            onClick={() => setShowMobileWeek((visible) => !visible)}
            aria-expanded={showMobileWeek}
          >
            {showMobileWeek ? "Zobrazit jeden den" : "Zobrazit celý týden"}
          </button>
          <div className="mobile-routine-list">
            {routines.map((routine) => {
              // Karta úkolu jde otočit jako mince, přední strana je ikona, zadní barva úkolu.
              const key = completionKey(selectedDay.key, routine.id);
              const isCompleted = completed[key] ?? false;
              const isAvailable = isTester
                ? true
                : weekOffset === 0 && selectedDay.key === todayKey;

              return (
                <label
                  className={`mobile-routine${isAvailable ? " available-cell" : ""}${isCompleted ? " completed" : ""}`}
                  style={{ "--routine-color": routine.color } as CSSProperties}
                  key={routine.id}
                >
                  <span className="routine-info">
                    <span className="routine-icon" aria-hidden="true">
                      {routine.icon}
                    </span>
                    <span>
                      <strong>{routine.name}</strong>
                      <small>{routine.detail}</small>
                    </span>
                  </span>
                  <span
                    className={`check-cell${isAvailable ? " available-cell" : ""}${isCompleted ? " completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      disabled={!isAvailable}
                      onChange={() =>
                        toggleRoutine(selectedDay.key, routine.id)
                      }
                      aria-label={`${routine.name}: ${selectedDay.fullLabel}`}
                    />
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
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Tabulka pro širší obrazovky vzniká ze seznamu dnů a seznamu úkolů. */}
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
                  {routine.icon}
                </span>
                <span>
                  <strong>{routine.name}</strong>
                  <small>{routine.detail}</small>
                </span>
              </div>
              {days.map((day) => {
                // Každé políčko tabulky má vlastní stav a pravidlo, kdy jde odškrtnout.
                const key = completionKey(day.key, routine.id);
                const isCompleted = completed[key] ?? false;
                const isAvailable = isTester
                  ? true
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
