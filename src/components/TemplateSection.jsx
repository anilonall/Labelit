export function TemplateSection({
  templates,
  activeTemplate,
  isBuiltInTemplate,
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
        <h2>Sablonlar</h2>
        <div className="action-group">
          <button className="ghost-button danger-button" type="button" onClick={onDeleteTemplate} disabled={isBuiltInTemplate(activeTemplate)}>Sablonu Sil</button>
          <button className="ghost-button" type="button" onClick={onLoadTemplateClick}>Ayar Yukle</button>
          <button className="ghost-button" type="button" onClick={onSaveTemplateFile}>JSON Kaydet</button>
        </div>
      </div>
      <label htmlFor="templateName">Template Adi</label>
      <input id="templateName" value={templateName} onChange={event => onTemplateNameChange(event.target.value)} placeholder="Ornek: Trendyol XL Etiketi" />
      <div className="row tight-row">
        <button type="button" onClick={onSaveToLibrary}>Kutuphane'ye Ekle</button>
        <button type="button" className="ghost-button" onClick={onClearLibrary} disabled={!hasCustomTemplates}>Kutuphane Temizle</button>
      </div>
      <div className="template-grid">
        {Object.entries(templates).map(([key, template]) => (
          <button key={key} type="button" className={`template-card ${activeTemplate === key ? "active" : ""}`} onClick={() => onApplyTemplate(key)}>
            <strong>{template.name}</strong>
            <span>{template.description}</span>
          </button>
        ))}
      </div>
      <input ref={templateInputRef} type="file" accept="application/json,.json" className="hidden" onChange={onTemplateFileChange} />
    </section>
  );
}
