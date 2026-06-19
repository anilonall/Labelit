import { HeaderControls } from "./HeaderControls";

function StartupCard({ title, description, templateKey, children, onClick }) {
  return (
    <button type="button" className="startup-card" data-start-template={templateKey} onClick={onClick}>
      <div className={`startup-thumb ${templateKey ? `thumb-${templateKey}` : "blank-thumb"}`}>{children}</div>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function SavedTemplateThumb() {
  return (
    <div className="mini-label">
      <div className="mini-top"></div>
      <div className="mini-block"></div>
      <div className="mini-grid"></div>
      <div className="mini-barcode"></div>
    </div>
  );
}

export function StartupOverlay({
  onBlankStart,
  onTemplateStart,
  savedTemplates,
  language,
  theme,
  onLanguageChange,
  onThemeToggle,
  t
}) {
  return (
    <div className="startup-overlay">
      <div className="startup-dialog">
        <div className="startup-head">
          <div>
            <p className="eyebrow">{t("welcome")}</p>
            <h1>{t("startupTitle")}</h1>
          </div>
          <HeaderControls
            language={language}
            theme={theme}
            t={t}
            onLanguageChange={onLanguageChange}
            onThemeToggle={onThemeToggle}
          />
        </div>
        <p className="panel-copy">{t("startupCopy")}</p>
        <div className="startup-grid">
          <StartupCard title={t("blankLabel")} description={t("blankLabelDescription")} onClick={onBlankStart}>
            <div className="blank-sheet"></div>
          </StartupCard>
          {savedTemplates.map(([key, template]) => (
            <StartupCard
              key={key}
              title={template.name}
              description={template.description || t("savedTemplateDescription")}
              templateKey={key}
              onClick={() => onTemplateStart(key)}
            >
              <SavedTemplateThumb />
            </StartupCard>
          ))}
        </div>
        {!savedTemplates.length && (
          <p className="panel-copy">{t("noSavedStartup")}</p>
        )}
      </div>
    </div>
  );
}
