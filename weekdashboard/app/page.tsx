"use client";
// Hlavní stránka aplikace: přihlášení profilu a týdenní přehled dětských úkolů.

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from "react";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/app/components/DashboardHeader";
import LoginPanel, { type LoginProfile } from "@/app/components/LoginPanel";
import ProgressSection from "@/app/components/ProgressSection";
import RewardModal from "@/app/components/RewardModal";
import RoutineGrid from "@/app/components/RoutineGrid";
import {
  days,
  routines,
  users,
  type CompletionState,
} from "@/app/data/dashboard-data";

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
  const [loginProfile, setLoginProfile] = useState<LoginProfile>(null);
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
  const completedRef = useRef<CompletionState>({});
  const progressRevisionRef = useRef(0);
  const pendingWritesRef = useRef<
    Record<string, { value: boolean; revision: number; storageKey: string }>
  >({});
  const [progressError, setProgressError] = useState("");
  // Tester nepotřebuje Supabase přihlášení, ostatní profily ano.
  const activeUser = localUser === "tester" ? localUser : authProfile;
  const weekStart = getWeekStart(weekOffset);
  const currentWeekDate = weekDateKey(weekStart);
  const storageKey = progressStorageKey(activeUser ?? "guest", weekStart);
  const todayKey = weekOffset === 0 ? getTodayKey() : "";
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
    const revisionAtStart = progressRevisionRef.current;
    const saved = window.localStorage.getItem(storageKey);
    const timeoutId = window.setTimeout(() => {
      if (progressRevisionRef.current !== revisionAtStart) return;
      const localProgress: CompletionState = saved ? JSON.parse(saved) : {};
      completedRef.current = localProgress;
      setCompleted(localProgress);
    }, 0);

    const isCloudTester = localUser === "tester";
    if (!supabase) {
      setProgressError(
        "Synchronizace mezi zařízeními není nastavená. Data se ukládají jen do tohoto zařízení.",
      );
      return () => window.clearTimeout(timeoutId);
    }
    if (!authUserId && !isCloudTester) {
      return () => window.clearTimeout(timeoutId);
    }

    const client = supabase;
    const progressTable = isCloudTester
      ? "dashboard_guest_progress"
      : "dashboard_progress";
    let cancelled = false;
    const loadCloudProgress = async () => {
      const requestRevision = progressRevisionRef.current;
      let progressQuery = client
        .from(progressTable)
        .select("completion_key, completed")
        .eq("week_start", currentWeekDate);
      progressQuery = isCloudTester
        ? progressQuery.eq("profile_key", "tester")
        : progressQuery.eq("owner_id", authUserId);
      const { data, error } = await progressQuery;

      if (cancelled || requestRevision !== progressRevisionRef.current) return;
      if (error) {
        setProgressError(
          `Postup se nepodařilo načíst z cloudu: ${error.message}`,
        );
        return;
      }

      const savedProgress = window.localStorage.getItem(storageKey);
      const localProgress: CompletionState = savedProgress
        ? JSON.parse(savedProgress)
        : {};
      if (data.length === 0 && Object.keys(localProgress).length > 0) {
        const rows = Object.entries(localProgress).map(
          ([completionKey, completed]) =>
            isCloudTester
              ? {
                  profile_key: "tester",
                  week_start: currentWeekDate,
                  completion_key: completionKey,
                  completed: Boolean(completed),
                }
              : {
                  owner_id: authUserId,
                  week_start: currentWeekDate,
                  completion_key: completionKey,
                  completed: Boolean(completed),
                },
        );
        const { error: migrationError } = await client
          .from(progressTable)
          .upsert(rows, {
            onConflict: isCloudTester
              ? "profile_key,week_start,completion_key"
              : "owner_id,week_start,completion_key",
          });
        if (migrationError) {
          setProgressError(
            `Postup se nepodařilo uložit do cloudu: ${migrationError.message}`,
          );
        } else if (
          !cancelled &&
          requestRevision === progressRevisionRef.current
        ) {
          completedRef.current = localProgress;
          setCompleted(localProgress);
          setProgressError("");
        }
        return;
      }

      const cloudProgress = Object.fromEntries(
        data
          .filter((row) => row.completed)
          .map((row) => [row.completion_key, true]),
      );
      const pendingProgress = Object.fromEntries(
        Object.entries(pendingWritesRef.current)
          .filter(([, write]) => write.storageKey === storageKey)
          .map(([key, write]) => [key, write.value]),
      );
      const mergedProgress = { ...cloudProgress, ...pendingProgress };
      completedRef.current = mergedProgress;
      setCompleted(mergedProgress);
      window.localStorage.setItem(storageKey, JSON.stringify(mergedProgress));
      setProgressError("");
    };

    void loadCloudProgress();

    const filter = isCloudTester
      ? "profile_key=eq.tester"
      : `owner_id=eq.${authUserId}`;
    const channel = client
      .channel(`dashboard-progress-${activeUser}-${currentWeekDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: progressTable,
          filter,
        },
        () => void loadCloudProgress(),
      )
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadCloudProgress();
    };
    const refreshInterval = window.setInterval(refreshWhenVisible, 30_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void client.removeChannel(channel);
    };
  }, [activeUser, authUserId, currentWeekDate, localUser, storageKey]);

  // Přihlásí zkušební profil bez Supabase, jen uloží značku do localStorage.
  function signInTester() {
    window.localStorage.setItem(userStorageKey, "tester");
    window.dispatchEvent(new Event("weekdashboard-user-change"));
  }

  // Ověří email a heslo přes Supabase a zkontroluje, že účet patří k vybranému profilu.
  async function signInAccount(event: SubmitEvent<HTMLFormElement>) {
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
      <LoginPanel
        loginProfile={loginProfile}
        email={email}
        password={password}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
        onTesterLogin={signInTester}
        onSelectProfile={setLoginProfile}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={signInAccount}
        onBack={() => setLoginProfile(null)}
      />
    );
  }

  // Přepne jeden úkol a uloží nový stav lokálně i do cloudu pro přihlášený účet.
  async function toggleRoutine(day: string, routine: string) {
    const key = completionKey(day, routine);
    const nextValue = !completedRef.current[key];
    const revision = ++progressRevisionRef.current;
    pendingWritesRef.current[key] = { value: nextValue, revision, storageKey };
    const nextProgress = { ...completedRef.current, [key]: nextValue };
    completedRef.current = nextProgress;
    setCompleted(nextProgress);
    window.localStorage.setItem(storageKey, JSON.stringify(nextProgress));

    const isCloudTester = localUser === "tester";
    if ((authUserId || isCloudTester) && supabase) {
      const result = isCloudTester
        ? await supabase.from("dashboard_guest_progress").upsert(
            {
              profile_key: "tester",
              week_start: currentWeekDate,
              completion_key: key,
              completed: nextValue,
            },
            { onConflict: "profile_key,week_start,completion_key" },
          )
        : await supabase.from("dashboard_progress").upsert(
            {
              owner_id: authUserId,
              week_start: currentWeekDate,
              completion_key: key,
              completed: nextValue,
            },
            { onConflict: "owner_id,week_start,completion_key" },
          );

      if (result.error) {
        setProgressError(
          `Postup se nepodařilo uložit do cloudu: ${result.error.message}`,
        );
      } else {
        if (pendingWritesRef.current[key]?.revision === revision) {
          delete pendingWritesRef.current[key];
        }
        progressRevisionRef.current += 1;
        setProgressError("");
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
        <RewardModal
          userName={currentUser.name}
          progress={progress}
          onDismiss={() => setDismissedRewardKey(rewardKey)}
        />
      )}
      <section className="dashboard" aria-labelledby="dashboard-title">
        {/* Záhlaví: pozdrav, přepínání týdne, souhrn a tlačítko odhlášení. */}
        <DashboardHeader
          vocative={currentUser.vocative}
          weekLabel={formatWeekLabel(weekStart)}
          completedCount={completedCount}
          totalCount={totalCount}
          onPreviousWeek={() => setWeekOffset((offset) => offset - 1)}
          onNextWeek={() => setWeekOffset((offset) => offset + 1)}
          onSignOut={signOut}
        />

        {/* Lišta ukazuje poměr dokončených úkolů za celý týden. */}
        <ProgressSection progress={progress} error={progressError} />

        <RoutineGrid
          todayKey={todayKey}
          selectedDayKey={selectedDayKey}
          showMobileWeek={showMobileWeek}
          completed={completed}
          onSelectDay={setSelectedDayKey}
          onToggleMobileWeek={() => setShowMobileWeek((visible) => !visible)}
          onToggleRoutine={toggleRoutine}
        />

        {completedTodayCount >= 2 && (
          <p className="footer-note">Dnes to jde skvěle. Jen tak dál!</p>
        )}
      </section>
    </main>
  );
}
