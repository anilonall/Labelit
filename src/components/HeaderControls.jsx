import { useEffect, useRef, useState } from "react";

const languageOptions = [
  { key: "tr", labelKey: "turkish", flag: "\u{1F1F9}\u{1F1F7}" },
  { key: "en", labelKey: "english", flag: "\u{1F1EC}\u{1F1E7}" },
  { key: "de", labelKey: "german", flag: "\u{1F1E9}\u{1F1EA}" },
  { key: "es", labelKey: "spanish", flag: "\u{1F1EA}\u{1F1F8}" },
  { key: "fr", labelKey: "french", flag: "\u{1F1EB}\u{1F1F7}" }
];

export function HeaderControls({ language, theme, onLanguageChange, onThemeToggle, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const activeLanguage = languageOptions.find(option => option.key === language) || languageOptions[0];

  useEffect(() => {
    const handlePointerDown = event => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = event => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="header-controls" aria-label={t("quickControls")}>
      <div ref={menuRef} className="language-menu">
        <button
          type="button"
          className={`icon-toggle language-trigger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(open => !open)}
          aria-label={t("language")}
          title={t("language")}
        >
          <span className="language-trigger-flag" aria-hidden="true">{activeLanguage.flag}</span>
          <span className="language-trigger-label">{t(activeLanguage.labelKey)}</span>
          <span className="language-trigger-caret" aria-hidden="true">▾</span>
        </button>

        {menuOpen && (
          <div className="language-dropdown" role="menu" aria-label={t("language")}>
            {languageOptions.map(option => (
              <button
                key={option.key}
                type="button"
                className={`language-option ${language === option.key ? "active" : ""}`}
                onClick={() => {
                  onLanguageChange(option.key);
                  setMenuOpen(false);
                }}
                role="menuitemradio"
                aria-checked={language === option.key}
              >
                <span className="language-option-flag" aria-hidden="true">{option.flag}</span>
                <span>{t(option.labelKey)}</span>
              </button>
            ))}
          </div>
        )}
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
