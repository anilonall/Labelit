import { useState } from "react";
import { socialProviders } from "../constants/auth";
import { HeaderControls } from "./HeaderControls";

function ProviderIcon({ providerId }) {
  if (providerId === "google") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon social-icon-google">
        <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-.8 2.3-1.7 3l2.8 2.2c1.7-1.5 2.6-3.9 2.6-6.9 0-.7-.1-1.4-.2-2.1H12z" />
        <path fill="#34A853" d="M12 21c2.4 0 4.5-.8 6-2.1l-2.8-2.2c-.8.5-1.8.9-3.2.9-2.4 0-4.5-1.7-5.2-4H3.8v2.3C5.3 18.9 8.4 21 12 21z" />
        <path fill="#4A90E2" d="M6.8 13.6c-.2-.5-.3-1.1-.3-1.6s.1-1.1.3-1.6V8.1H3.8C3.3 9.3 3 10.6 3 12s.3 2.7.8 3.9l3-2.3z" />
        <path fill="#FBBC05" d="M12 6.4c1.3 0 2.5.4 3.4 1.3l2.5-2.5C16.5 3.8 14.4 3 12 3 8.4 3 5.3 5.1 3.8 8.1l3 2.3c.7-2.3 2.8-4 5.2-4z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon social-icon-github">
      <path
        fill="currentColor"
        d="M12 .5C5.6.5.5 5.7.5 12.2c0 5.2 3.4 9.6 8.1 11.1.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.8-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.4-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.4 1.3 1-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.6 3.4-1.3 3.4-1.3.7 1.6.2 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.8-2.9 5.8-5.6 6.1.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.7-1.6 8.1-6 8.1-11.1C23.5 5.7 18.4.5 12 .5z"
      />
    </svg>
  );
}

export function AuthScreen({
  language,
  theme,
  onLanguageChange,
  onThemeToggle,
  onSubmit,
  onRegister,
  onProviderSubmit,
  loading,
  checkingSession,
  t
}) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setInfo("");

    const payload = mode === "register"
      ? { email, name, password }
      : { email, password };

    if (mode === "register" && password !== confirmPassword) {
      setError(t("authPasswordMismatch"));
      return;
    }

    const result = mode === "register"
      ? await onRegister(payload)
      : await onSubmit(payload);

    if (!result?.ok) {
      setError(
        result?.message || (mode === "register" ? t("authRegisterFailed") : t("authLoginFailed"))
      );
      return;
    }

    if (result?.message) {
      setInfo(result.message);
    }
  };

  const handleProviderSubmit = provider => {
    const result = onProviderSubmit(provider);
    if (!result?.ok) {
      setError(result?.message || t("authProviderPending", { provider }));
      return;
    }

    setError("");
    setInfo(t("authProviderRedirect"));
  };

  return (
    <div className="startup-overlay auth-overlay">
      <div className="startup-dialog auth-dialog">
        <div className="startup-head auth-head">
          <div>
            <p className="eyebrow">{t("authEyebrow")}</p>
            <h1>{mode === "register" ? t("authRegisterTitle") : t("authTitle")}</h1>
          </div>
          <HeaderControls
            language={language}
            theme={theme}
            t={t}
            onLanguageChange={onLanguageChange}
            onThemeToggle={onThemeToggle}
          />
        </div>

        <p className="panel-copy">{checkingSession ? t("authCheckingSession") : t("authCopy")}</p>

        <div className="auth-layout">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-mode-switch" aria-label={t("authModeLabel")}>
              <button
                type="button"
                className={`auth-mode-button ${mode === "login" ? "active" : ""}`}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfo("");
                }}
                disabled={loading || checkingSession}
              >
                {t("authLoginTab")}
              </button>
              <button
                type="button"
                className={`auth-mode-button ${mode === "register" ? "active" : ""}`}
                onClick={() => {
                  setMode("register");
                  setError("");
                  setInfo("");
                }}
                disabled={loading || checkingSession}
              >
                {t("authRegisterTab")}
              </button>
            </div>

            <div className="auth-provider-list">
              {socialProviders.map(provider => (
                <button
                  key={provider.id}
                  type="button"
                  className="social-button"
                  onClick={() => handleProviderSubmit(provider.id)}
                  disabled={loading || checkingSession}
                >
                  <span className="social-button-content">
                    <ProviderIcon providerId={provider.id} />
                    <span>{t("authContinueWith", { provider: provider.label })}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="auth-divider">
              <span>{t("authOr")}</span>
            </div>

            {mode === "register" && (
              <>
                <label htmlFor="authName">{t("authNameLabel")}</label>
                <input
                  id="authName"
                  type="text"
                  autoComplete="name"
                  placeholder={t("authNamePlaceholder")}
                  value={name}
                  onChange={event => setName(event.target.value)}
                  disabled={loading || checkingSession}
                  required
                />
              </>
            )}

            <label htmlFor="authEmail">{t("authEmailLabel")}</label>
            <input
              id="authEmail"
              type="email"
              autoComplete="email"
              placeholder={t("authEmailPlaceholder")}
              value={email}
              onChange={event => setEmail(event.target.value)}
              disabled={loading || checkingSession}
              required
            />

            <label htmlFor="authPassword">{t("authPasswordLabel")}</label>
            <input
              id="authPassword"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              placeholder={t("authPasswordPlaceholder")}
              value={password}
              onChange={event => setPassword(event.target.value)}
              disabled={loading || checkingSession}
              required
            />

            {mode === "register" && (
              <>
                <label htmlFor="authConfirmPassword">{t("authConfirmPasswordLabel")}</label>
                <input
                  id="authConfirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("authConfirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  disabled={loading || checkingSession}
                  required
                />
              </>
            )}

            {error && <p className="auth-error">{error}</p>}
            {info && <p className="auth-hint">{info}</p>}

            <button type="submit" disabled={loading || checkingSession}>
              {checkingSession
                ? t("authCheckingSession")
                : loading
                  ? (mode === "register" ? t("authRegistering") : t("authSigningIn"))
                  : (mode === "register" ? t("authRegisterSubmit") : t("authSubmit"))}
            </button>
          </form>

          <div className="auth-sidecard">
            <strong>{mode === "register" ? t("authRegisterSideTitle") : t("authMembershipTitle")}</strong>
            <p>{mode === "register" ? t("authRegisterSideCopy") : t("authMembershipCopy")}</p>
            <p className="auth-hint">{t("authBackendNotice")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
