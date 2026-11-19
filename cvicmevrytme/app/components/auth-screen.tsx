import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import Icon from "./app-icon";

export default function AuthScreen({ client }: { client: SupabaseClient<Database> | null }) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const result =
        mode === "signIn"
          ? await client.auth.signInWithPassword({ email, password })
          : await client.auth.signUp({ email, password });
      if (result.error) {
        setMessage(result.error.message);
      } else {
        setSuccess(true);
        setMessage(
          mode === "signUp" && !result.data.session
            ? "Účet je vytvořený. Potvrď registraci odkazem v e-mailu a pak se přihlas."
            : "Přihlášení probíhá…",
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Přihlášení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-intro">
          <div className="brand">
            <span className="brand-mark"><Icon name="brand" size={19} /></span>
            běžecký deník
          </div>
          <div className="auth-story">
            <p className="auth-story-label"><span /> Tvůj prostor pro pohyb</p>
            <h2>Každý běh má <span>svůj příběh.</span></h2>
            <p className="auth-story-description">
              Uchovej si své běhy na jednom místě a sleduj cestu, kterou máš za sebou.
            </p>
            <div className="auth-route">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 520 230" fill="none" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="auth-route-gradient" x1="58" y1="167" x2="447" y2="49" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8264ff" />
                    <stop offset="1" stopColor="#65d9ee" />
                  </linearGradient>
                </defs>
                <image href="/auth-topographic-map.svg" x="0" y="0" width="520" height="230" preserveAspectRatio="none" />
                <path className="auth-route-shadow" d="M58 167c55-3 40-53 93-47 34 4 25 36 66 29 35-6 28-50 67-56 44-7 54 28 90 9 23-12 33-37 73-53" />
                <path className="auth-route-path" d="M58 167c55-3 40-53 93-47 34 4 25 36 66 29 35-6 28-50 67-56 44-7 54 28 90 9 23-12 33-37 73-53" />
                <circle cx="58" cy="167" r="7" fill="#141b2a" stroke="#a48fff" strokeWidth="3" />
                <circle cx="447" cy="49" r="7" fill="#65d9ee" stroke="#d4fbff" strokeWidth="3" />
              </svg>
              <a className="auth-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
                © OpenStreetMap contributors · Elevation: Mapzen Terrain
              </a>
              <div className="auth-route-caption" aria-hidden="true">
                <span className="auth-route-icon"><Icon name="runs" size={18} /></span>
                <span><strong>Každý kilometr se počítá</strong><small>Tvá cesta, tvé tempo.</small></span>
              </div>
            </div>
          </div>
          <p className="auth-intro-footer">Pro všechny cesty, které stojí za zaznamenání.</p>
        </div>
        <section className="auth-card" aria-labelledby="auth-heading">
          <div className="auth-card-icon"><Icon name="runs" size={21} /></div>
          <p className="eyebrow">Tvůj běžecký deník</p>
          <h1 id="auth-heading">
            {!client ? "Ještě chybí nastavení připojení" : mode === "signIn" ? "Vítej zpátky." : "Vytvoř si účet."}
          </h1>
          <p className="auth-description">
            {client
              ? mode === "signIn"
                ? "Přihlas se a pokračuj tam, kde jsi skončila."
                : "Založ si svůj prostor pro všechny další běhy."
              : "Doplň Supabase URL a veřejný klíč do souboru .env.local a restartuj vývojový server."}
          </p>
          {client && (
            <>
              <form className="auth-form" onSubmit={submit}>
                <label>
                  E-mail
                  <input
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tvuj@email.cz"
                    required
                    type="email"
                    value={email}
                  />
                </label>
                <label>
                  Heslo
                  <input
                    autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Zadej heslo"
                    required
                    type="password"
                    value={password}
                  />
                </label>
                <button className="primary-button auth-submit" disabled={busy} type="submit">
                  {busy ? "Pracuji…" : mode === "signIn" ? "Přihlásit se" : "Vytvořit účet"}
                  <Icon name="arrow" size={17} />
                </button>
              </form>
              {message && (
                <p className={`auth-message${success ? " success" : ""}`} role="status">
                  {message}
                </p>
              )}
              <div className="auth-switch">
                <span>{mode === "signIn" ? "Ještě nemáš účet?" : "Už máš účet?"}</span>
                <button
                  className="text-button auth-mode-button"
                  onClick={() => {
                    setMode(mode === "signIn" ? "signUp" : "signIn");
                    setMessage("");
                  }}
                  type="button"
                >
                  {mode === "signIn" ? "Vytvoř si ho" : "Přihlas se"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
