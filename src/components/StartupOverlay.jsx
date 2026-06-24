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

function BuiltInTemplateThumb({ templateKey }) {
  return (
    <div className={`mini-label theme-${templateKey || "shipping"}`}>
      <div className="mini-top"></div>
      <div className="mini-block accent"></div>
      <div className="mini-grid"></div>
      <div className="mini-barcode"></div>
    </div>
  );
}

export function StartupOverlay({
  onBlankStart,
  onTemplateStart,
  builtInTemplates,
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
        <div className="startup-section">
          <div className="section-head">
            <h2>{t("startFresh")}</h2>
            <p className="panel-copy compact-copy">{t("startFreshCopy")}</p>
          </div>
          <div className="startup-grid startup-grid-featured">
            <StartupCard title={t("blankLabel")} description={t("blankLabelDescription")} onClick={onBlankStart}>
              <div className="blank-sheet"></div>
            </StartupCard>
            {builtInTemplates.map(([key, template]) => (
              <StartupCard
                key={key}
                title={template.name}
                description={template.description}
                templateKey={key}
                onClick={() => onTemplateStart(key)}
              >
                <BuiltInTemplateThumb templateKey={key} />
              </StartupCard>
            ))}
          </div>
        </div>

        <div className="startup-section">
          <div className="section-head">
            <h2>{t("savedTemplates")}</h2>
            <p className="panel-copy compact-copy">{t("savedTemplateSectionCopy")}</p>
          </div>
          {savedTemplates.length ? (
            <div className="startup-grid">
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
          ) : (
            <p className="panel-copy">{t("noSavedStartup")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
