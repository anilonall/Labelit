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
  onProviderSubmit,
  t
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    const result = onSubmit(email);

    if (!result?.ok) {
      setError(t("authUnauthorized"));
      setInfo("");
      return;
    }

    setError("");
    setInfo("");
  };

  const handleProviderSubmit = provider => {
    const result = onProviderSubmit(provider);
    if (!result?.ok) {
      setError("");
      setInfo(t("authProviderPending", { provider }));
      return;
    }

    setError("");
    setInfo("");
  };

  return (
    <div className="startup-overlay auth-overlay">
      <div className="startup-dialog auth-dialog">
        <div className="startup-head auth-head">
          <div>
            <p className="eyebrow">{t("authEyebrow")}</p>
            <h1>{t("authTitle")}</h1>
          </div>
          <HeaderControls
            language={language}
            theme={theme}
            t={t}
            onLanguageChange={onLanguageChange}
            onThemeToggle={onThemeToggle}
          />
        </div>

        <p className="panel-copy">{t("authCopy")}</p>

        <div className="auth-layout">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-provider-list">
              {socialProviders.map(provider => (
                <button
                  key={provider.id}
                  type="button"
                  className="social-button"
                  onClick={() => handleProviderSubmit(provider.id)}
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

            <label htmlFor="authEmail">{t("authEmailLabel")}</label>
            <input
              id="authEmail"
              type="email"
              autoComplete="email"
              placeholder={t("authEmailPlaceholder")}
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />

            {error && <p className="auth-error">{error}</p>}
            {info && <p className="auth-hint">{info}</p>}

            <button type="submit">{t("authSubmit")}</button>
          </form>

          <div className="auth-sidecard">
            <strong>{t("authMembershipTitle")}</strong>
            <p>{t("authMembershipCopy")}</p>
            <p className="auth-hint">{t("authFrontendNotice")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
