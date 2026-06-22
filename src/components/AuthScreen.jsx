import { useState } from "react";
import { socialProviders } from "../constants/auth";
import { HeaderControls } from "./HeaderControls";

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
                  {t("authContinueWith", { provider: provider.label })}
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
