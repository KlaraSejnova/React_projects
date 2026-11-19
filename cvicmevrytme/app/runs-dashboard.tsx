"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { importRuns, isLongRun, isRun, prepareTcxImport, type Run } from "@/lib/runs";
import { removeShortRuns } from "@/lib/remove-short-runs";
import { toggleRunGroup, toggleRunSelection } from "@/lib/chart";
import { getGpsRoutes } from "@/lib/gps";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "./components/auth-screen";
import ComparisonContainer from "./components/comparison-container";
import Icon from "./components/app-icon";
import Navigation from "./components/navigation";
import OverviewContainer from "./components/overview-container";
import RunsContainer from "./components/runs-container";
import type { ChartMetric, Page, Period } from "./components/types";

type DashboardNotice = { text: string; success: boolean; details: string[] };

let clockSnapshot = 0;

function subscribeToClock(callback: () => void): () => void {
  const update = () => {
    clockSnapshot = Date.now();
    callback();
  };
  update();
  const interval = window.setInterval(update, 60_000);
  return () => window.clearInterval(interval);
}

function getClockSnapshot(): number {
  return clockSnapshot;
}

function getServerClockSnapshot(): number {
  return 0;
}

export default function RunsDashboard() {
  const [storedRuns, setStoredRuns] = useState<Run[]>([]);
  const [dataError, setDataError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const now = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );
  const [activePage, setActivePage] = useState<Page>("overview");
  const [period, setPeriod] = useState<Period>("30");
  const [metric, setMetric] = useState<ChartMetric>("pace");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionCustomized, setSelectionCustomized] = useState(false);
  const [notice, setNoticeState] = useState<DashboardNotice | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [deletingShortRuns, setDeletingShortRuns] = useState(false);
  const folderInput = useRef<HTMLInputElement>(null);
  const runs = useMemo(() => storedRuns.filter(isLongRun), [storedRuns]);
  const shortRuns = useMemo(() => storedRuns.filter((run) => !isLongRun(run)), [storedRuns]);

  const setNotice = (text: string) => {
    setNoticeState(text ? {
      text,
      success: text.startsWith("Importováno") || text.startsWith("Běh „") || text.startsWith("Odstraněno") && !text.includes("Další se nepodařilo"),
      details: [],
    } : null);
  };

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let requestId = 0;
    const loadRuns = async (currentSession: Session | null) => {
      const currentRequestId = ++requestId;
      setSession(currentSession);
      setDataError("");
      if (!currentSession) {
        setStoredRuns([]);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const loadedRuns: Run[] = [];
        let invalidRuns = 0;
        let offset = 0;
        while (true) {
          const { data, error } = await client
            .from("runs")
            .select("id, run")
            .eq("user_id", currentSession.user.id)
            .order("id")
            .range(offset, offset + 999);
          if (currentRequestId !== requestId) return;
          if (error) throw new Error(error.message);
          if (!data.length) break;
          for (const row of data) {
            if (isRun(row.run) && row.id === row.run.id) loadedRuns.push(row.run);
            else invalidRuns += 1;
          }
          offset += data.length;
        }
        setStoredRuns(loadedRuns);
        if (invalidRuns) {
          setDataError("Některé uložené běhy mají neplatný formát a nebyly zobrazeny.");
        }
      } catch (error) {
        if (currentRequestId === requestId) {
          const message = error instanceof Error ? error.message : "Neznámá chyba.";
          setDataError(`Běhy se nepodařilo načíst ze Supabase: ${message}`);
          setStoredRuns([]);
        }
      } finally {
        if (currentRequestId === requestId) setAuthLoading(false);
      }
    };

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => {
        void loadRuns(nextSession);
      }, 0);
    });

    return () => {
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  const sortedRuns = useMemo(
    () => [...runs].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    [runs],
  );
  const visibleRuns = useMemo(() => {
    if (period === "all") return sortedRuns;
    const cutoff = now - Number(period) * 24 * 60 * 60 * 1000;
    return sortedRuns.filter((run) => Date.parse(run.date) >= cutoff);
  }, [now, period, sortedRuns]);
  const availableRunIds = new Set(runs.map((run) => run.id));
  const effectiveSelectedIds = selectionCustomized
    ? selectedIds.filter((id) => availableRunIds.has(id))
    : sortedRuns.slice(0, 3).map((run) => run.id);
  const gpsRoutes = useMemo(() => getGpsRoutes(sortedRuns), [sortedRuns]);
  const gpsIds = new Set(gpsRoutes.map(({ run }) => run.id));
  const compareIds = selectionCustomized
    ? effectiveSelectedIds.filter((id) => gpsIds.has(id))
    : gpsRoutes.slice(0, 3).map(({ run }) => run.id);
  const compareIdSet = new Set(compareIds);
  const gpsComparedRuns = sortedRuns.filter((run) => compareIdSet.has(run.id));
  const routeRun = gpsComparedRuns[0];
  const pageTitle =
    activePage === "runs" ? "Moje běhy" : activePage === "compare" ? "Porovnání běhů" : "Přehled běhů";
  const pageDescription =
    activePage === "runs"
      ? "Historie všech tvých aktivit na jednom místě."
      : activePage === "compare"
        ? "Vyber běhy a porovnej tempo a převýšení."
        : "Každý běh tě posouvá o kousek dál.";

  const saveImportedRuns = async (imported: Run[], warnings: string[]) => {
    const saved: Run[] = [];
    let persistenceError: string | undefined;
    if (imported.length && supabase && session) {
      for (let index = 0; index < imported.length; index += 10) {
        const batch = imported.slice(index, index + 10);
        setImportProgress(`Ukládám běhy ${index + 1}–${index + batch.length} z ${imported.length}…`);
        try {
          const { error } = await supabase.from("runs").upsert(
            batch.map((run) => ({ user_id: session.user.id, id: run.id, run })),
            { onConflict: "user_id,id" },
          );
          if (error) {
            persistenceError = `Další běhy se nepodařilo uložit do Supabase: ${error.message}`;
            break;
          }
          saved.push(...batch);
        } catch (error) {
          persistenceError = `Další běhy se nepodařilo uložit do Supabase: ${error instanceof Error ? error.message : "Neznámá chyba."}`;
          break;
        }
      }
    } else if (imported.length) {
      persistenceError = "Běhy nelze uložit: přihlas se znovu a opakuj import.";
    }

    const showAllPeriods = period !== "all" && saved.some((run) =>
      Date.parse(run.date) < now - Number(period) * 24 * 60 * 60 * 1000,
    );
    if (saved.length) {
      const savedIds = new Set(saved.map((run) => run.id));
      setStoredRuns((current) => [...saved, ...current.filter((run) => !savedIds.has(run.id))]);
      setSelectionCustomized(true);
      setSelectedIds([...new Set([...saved.slice(0, 3).map((run) => run.id), ...effectiveSelectedIds])]);
      if (showAllPeriods) setPeriod("all");
      setActivePage("runs");
    }
    if (warnings.length || persistenceError) {
      setNoticeState({
        text: [
          saved.length ? `Uloženo nebo aktualizováno ${saved.length} běhů.` : "",
          persistenceError ?? "",
          persistenceError ? `Neuloženo: ${imported.length - saved.length} běhů.` : "",
          !saved.length && !persistenceError ? "Žádný běh se nepodařilo importovat." : "",
          showAllPeriods ? "Zobrazují se všechny běhy." : "",
        ].filter(Boolean).join(" "),
        success: saved.length > 0 && !persistenceError,
        details: warnings,
      });
    } else if (!saved.length) {
      setNotice("Žádný běh se nepodařilo importovat.");
    } else {
      setNotice(`Importováno ${saved.length} ${saved.length === 1 ? "běh" : saved.length < 5 ? "běhy" : "běhů"} (včetně případných aktualizací).${showAllPeriods ? " Zobrazují se všechny běhy." : ""}`);
    }
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selected = Array.from(input.files ?? []);
    input.value = "";
    if (!selected.length) return;
    const files = selected.filter((file) => file.name.toLowerCase().endsWith(".tcx"));
    if (!files.length) {
      setNotice("Ve vybrané složce nejsou žádné soubory TCX.");
      return;
    }
    setImporting(true);
    setNotice("");
    setImportProgress(`Načítám soubory 0 z ${files.length}…`);
    const imported: Run[] = [];
    const warnings: string[] = [];
    const importedIds = new Set<string>();
    let shortCount = 0;
    try {
      for (const [index, file] of files.entries()) {
        try {
          const result = await importRuns(file);
          for (const run of result.runs) {
            if (!isLongRun(run)) {
              shortCount += 1;
            } else if (importedIds.has(run.id)) {
              warnings.push(`${file.name}: Stejný běh byl ve vybraných souborech vícekrát; použit je první výskyt.`);
            } else {
              importedIds.add(run.id);
              imported.push(run);
            }
          }
          warnings.push(...result.warnings.map((warning) => `${file.name}: ${warning}`));
        } catch (error) {
          warnings.push(`${file.name}: ${error instanceof Error ? error.message : "Soubor se nepodařilo načíst."}`);
        }
        if ((index + 1) % 50 === 0 || index + 1 === files.length) {
          setImportProgress(`Načítám soubory ${index + 1} z ${files.length}…`);
        }
      }
      if (shortCount) warnings.push(`Vynecháno ${shortCount} běhů o vzdálenosti 3 km nebo méně.`);
      const { ready, skipped } = prepareTcxImport(imported, storedRuns);
      if (skipped) {
        const description = skipped === 1 ? "běh nebyl importován" : skipped < 5 ? "běhy nebyly importovány" : "běhů nebylo importováno";
        warnings.push(`${skipped} ${description} kvůli možné shodě s již uloženými běhy.`);
      }
      await saveImportedRuns(ready, warnings);
    } finally {
      setImportProgress("");
      setImporting(false);
    }
  };

  const toggleComparison = (id: string) => {
    setSelectionCustomized(true);
    setSelectedIds(toggleRunSelection(selectionCustomized ? effectiveSelectedIds : compareIds, id));
  };

  const toggleComparisonGroup = (ids: string[]) => {
    setSelectionCustomized(true);
    setSelectedIds(toggleRunGroup(selectionCustomized ? effectiveSelectedIds : compareIds, ids));
  };

  const deleteRun = async (id: string) => {
    const run = runs.find((item) => item.id === id);
    if (!run || !supabase || !session) return;
    try {
      const { error } = await supabase
        .from("runs")
        .delete()
        .eq("user_id", session.user.id)
        .eq("id", id);
      if (error) {
        setNotice(`Běh se nepodařilo odebrat: ${error.message}`);
        return;
      }
    } catch (error) {
      setNotice(`Běh se nepodařilo odebrat: ${error instanceof Error ? error.message : "Neznámá chyba."}`);
      return;
    }
    setStoredRuns((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    setNotice(`Běh „${run.title}“ byl odebrán.`);
  };

  const deleteShortRuns = async () => {
    if (!supabase || !session || !shortRuns.length || deletingShortRuns) return;
    if (!window.confirm(`Trvale odstranit ${shortRuns.length} uložených běhů o vzdálenosti 3 km nebo méně z tohoto účtu?`)) return;
    setDeletingShortRuns(true);
    setNotice("");
    try {
      const { deletedIds, error } = await removeShortRuns(supabase, session.user.id, shortRuns.map((run) => run.id));
      const deleted = new Set(deletedIds);
      setStoredRuns((current) => current.filter((run) => !deleted.has(run.id)));
      if (error) {
        setNotice(`Odstraněno ${deletedIds.length} z ${shortRuns.length} krátkých běhů. Další se nepodařilo odstranit: ${error}`);
      } else {
        setNotice(`Odstraněno ${deletedIds.length} běhů o vzdálenosti 3 km nebo méně.`);
      }
    } finally {
      setDeletingShortRuns(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setNotice(`Odhlášení se nepodařilo: ${error.message}`);
    } catch (error) {
      setNotice(`Odhlášení se nepodařilo: ${error instanceof Error ? error.message : "Neznámá chyba."}`);
    }
  };

  const openTcxFolder = () => {
    const input = folderInput.current;
    if (!input || !("webkitdirectory" in input)) {
      setNotice("Tento prohlížeč neumí vybrat složku. Použij pro import prohlížeč, který výběr složek podporuje, například Chrome na počítači.");
      return;
    }
    input.click();
  };

  if (authLoading) {
    return <main className="auth-page"><p className="auth-loading">Připojuji běžecký deník…</p></main>;
  }
  if (!session) return <AuthScreen client={supabase} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icon name="brand" size={19} /></span>
          běžecký deník
        </div>
        <p className="nav-label">Trénink</p>
        <Navigation activePage={activePage} onNavigate={setActivePage} />
        <div className="sidebar-note">
          <strong>Tvůj osobní přehled</strong>
          <p>Data se synchronizují s tvým účtem a zůstávají dostupná na přihlášených zařízeních.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Běžecký deník <span aria-hidden="true">/</span> <strong>{pageTitle}</strong></div>
          <div className="topbar-right">
            <span className="sync-pill"><span className="status-dot" /> {dataError ? "Chyba synchronizace" : "Synchronizováno se Supabase"}</span>
            <span className="avatar" aria-label="Přihlášený účet">{session.user.email?.slice(0, 2).toUpperCase() ?? "?"}</span>
            <button className="text-button" onClick={signOut} type="button">Odhlásit</button>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">{activePage === "overview" ? "Tvoje běžecká cesta" : "Tréninkový deník"}</p>
              <h1>{pageTitle}</h1>
              <p>{pageDescription}</p>
            </div>
            <div className="import-actions">
              <button className="primary-button" disabled={importing} onClick={openTcxFolder}>
                <Icon name="upload" size={15} />
                {importing ? "Pracuji…" : "Importovat běh"}
              </button>
            </div>
            <input
              aria-label="Vybrat složku se soubory TCX"
              hidden
              multiple
              onChange={handleFiles}
              ref={(input) => {
                folderInput.current = input;
                if (input && "webkitdirectory" in input) input.webkitdirectory = true;
              }}
              type="file"
            />
          </section>

          {importProgress && <p className="import-hint" role="status">{importProgress}</p>}
          {dataError && <div className="notice" role="status">{dataError}</div>}
          {notice && (
            <div className={notice.success ? "notice success-notice" : "notice"} role="status">
              {notice.text}
              {notice && notice.details.length > 0 && (
                <details className="tcx-warnings">
                  <summary>Upozornění: {notice.details.length} – zobrazit podrobnosti</summary>
                  <ul>{notice.details.map((detail, index) => <li key={index}>{detail}</li>)}</ul>
                </details>
              )}
            </div>
          )}
          {shortRuns.length > 0 && (
            <div className="notice" role="status">
              {shortRuns.length} uložených běhů o vzdálenosti 3 km nebo méně je skryto z přehledů.
              {" "}
              <button className="text-button" disabled={deletingShortRuns} onClick={deleteShortRuns} type="button">
                {deletingShortRuns ? "Odstraňuji…" : "Trvale odstranit krátké běhy"}
              </button>
            </div>
          )}

          {activePage === "overview" && (
            <OverviewContainer
              runs={runs}
              visibleRuns={visibleRuns}
              sortedRuns={sortedRuns}
              now={now}
              period={period}
              setPeriod={setPeriod}
              setActivePage={setActivePage}
              deleteRun={deleteRun}
            />
          )}

          {activePage === "runs" && (
            <RunsContainer visibleRuns={visibleRuns} period={period} setPeriod={setPeriod} deleteRun={deleteRun} />
          )}

          {activePage === "compare" && (
            <ComparisonContainer
              gpsRoutes={gpsRoutes}
              comparedRuns={gpsComparedRuns}
              routeRun={routeRun}
              metric={metric}
              setMetric={setMetric}
              toggleComparison={toggleComparison}
              toggleGroup={toggleComparisonGroup}
              deleteRun={deleteRun}
            />
          )}
        </div>
      </main>
      <Navigation activePage={activePage} onNavigate={setActivePage} mobile />
    </div>
  );
}
