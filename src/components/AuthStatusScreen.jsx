import { HeaderControls } from "./HeaderControls";

export function AuthStatusScreen({
  language,
  theme,
  title,
  copy,
  actionLabel,
  onAction,
  onLanguageChange,
  onThemeToggle,
  t
}) {
  return (
    <div className="startup-overlay auth-overlay">
      <div className="startup-dialog auth-dialog">
        <div className="startup-head auth-head">
          <div>
            <p className="eyebrow">{t("authEyebrow")}</p>
            <h1>{title}</h1>
          </div>
          <HeaderControls
            language={language}
            theme={theme}
            t={t}
            onLanguageChange={onLanguageChange}
            onThemeToggle={onThemeToggle}
          />
        </div>

        <div className="auth-layout auth-layout-single">
          <div className="auth-card auth-status-card">
            <p className="panel-copy">{copy}</p>
            {actionLabel && onAction && (
              <button type="button" onClick={onAction}>
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
