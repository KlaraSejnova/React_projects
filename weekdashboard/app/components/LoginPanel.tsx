import type { SubmitEvent } from "react";
import { users } from "@/app/data/dashboard-data";

export type LoginProfile = "barca" | "terka" | null;

type LoginPanelProps = {
  loginProfile: LoginProfile;
  email: string;
  password: string;
  loginError: string;
  isLoggingIn: boolean;
  onTesterLogin: () => void;
  onSelectProfile: (profile: "barca" | "terka") => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export default function LoginPanel({
  loginProfile,
  email,
  password,
  loginError,
  isLoggingIn,
  onTesterLogin,
  onSelectProfile,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
}: LoginPanelProps) {
  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <p className="eyebrow">Můj týden</p>
        <h1 id="login-title">Kdo se dnes přihlašuje?</h1>
        <p className="login-intro">Vyber svůj profil a otevři si svůj týden.</p>
        {!loginProfile ? (
          <div className="login-options">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                className={`login-option login-option-${user.id}`}
                onClick={() =>
                  user.id === "tester"
                    ? onTesterLogin()
                    : onSelectProfile(user.id as "barca" | "terka")
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
          <form className="login-form" onSubmit={onSubmit} noValidate>
            <p className="login-selected">
              Přihlašuješ se jako {loginProfile === "barca" ? "Barča" : "Terka"}
            </p>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
              />
            </label>
            <label>
              Heslo
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
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
            <button type="button" className="login-back" onClick={onBack}>
              Zpět k výběru
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
