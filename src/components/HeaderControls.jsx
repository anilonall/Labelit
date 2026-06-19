export function HeaderControls({ language, theme, onLanguageChange, onThemeToggle, t }) {
  return (
    <div className="header-controls" aria-label={t("quickControls")}>
      <div className="icon-toggle-group" aria-label={t("language")}>
        <button
          type="button"
          className={`icon-toggle ${language === "tr" ? "active" : ""}`}
          onClick={() => onLanguageChange("tr")}
          title={t("turkish")}
          aria-label={t("turkish")}
        >
          <span aria-hidden="true">{"\u{1F1F9}\u{1F1F7}"}</span>
        </button>
        <button
          type="button"
          className={`icon-toggle ${language === "en" ? "active" : ""}`}
          onClick={() => onLanguageChange("en")}
          title={t("english")}
          aria-label={t("english")}
        >
          <span aria-hidden="true">{"\u{1F1EC}\u{1F1E7}"}</span>
        </button>
      </div>

      <button
        type="button"
        className={`icon-toggle theme-toggle ${theme === "light" ? "light-active" : "dark-active"}`}
        onClick={onThemeToggle}
        title={theme === "dark" ? t("switchToLight") : t("switchToDark")}
        aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
      >
        <span aria-hidden="true">{theme === "dark" ? "\u2600" : "\u263E"}</span>
      </button>
    </div>
  );
}
