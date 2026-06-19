export function TemplateSection({
  visibleTemplates,
  activeTemplate,
  isBuiltInTemplate,
  t,
  templateName,
  onTemplateNameChange,
  onDeleteTemplate,
  onLoadTemplateClick,
  onSaveTemplateFile,
  onSaveToLibrary,
  onClearLibrary,
  hasCustomTemplates,
  onApplyTemplate,
  templateInputRef,
  onTemplateFileChange
}) {
  return (
    <section className="panel-section">
      <div className="section-head">
        <h2>{t("templates")}</h2>
        <div className="action-group">
          <button className="ghost-button danger-button" type="button" onClick={onDeleteTemplate} disabled={isBuiltInTemplate(activeTemplate)}>{t("deleteTemplate")}</button>
          <button className="ghost-button" type="button" onClick={onLoadTemplateClick}>{t("loadSettings")}</button>
          <button className="ghost-button" type="button" onClick={onSaveTemplateFile}>{t("saveJson")}</button>
        </div>
      </div>
      <label htmlFor="templateName">{t("templateName")}</label>
      <input id="templateName" value={templateName} onChange={event => onTemplateNameChange(event.target.value)} placeholder={t("templatePlaceholder")} />
      <div className="row tight-row">
        <button type="button" onClick={onSaveToLibrary}>{t("addToLibrary")}</button>
        <button type="button" className="ghost-button" onClick={onClearLibrary} disabled={!hasCustomTemplates}>{t("clearLibrary")}</button>
      </div>
      <label>{t("savedTemplates")}</label>
      {visibleTemplates.length ? (
        <div className="template-grid">
          {visibleTemplates.map(([key, template]) => (
            <button key={key} type="button" className={`template-card ${activeTemplate === key ? "active" : ""}`} onClick={() => onApplyTemplate(key)}>
              <strong>{template.name}</strong>
              <span>{template.description}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="scan-hint">{t("noSavedTemplates")}</p>
      )}
      <input ref={templateInputRef} type="file" accept="application/json,.json" className="hidden" onChange={onTemplateFileChange} />
    </section>
  );
}
