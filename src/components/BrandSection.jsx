import { FormField } from "./FormField";

function ToggleGroup({ title, items, form, onFieldChange }) {
  return (
    <div className="option-group">
      <h3>{title}</h3>
      <div className="toggle-grid">
        {items.map(([key, text]) => (
          <label key={key} className="toggle">
            <input type="checkbox" checked={form[key]} onChange={event => onFieldChange(key, event.target.checked)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function BrandSection({ form, t, logoStatus, logoInputRef, onFieldChange, onLogoUpload, onZoomIn, onZoomOut }) {
  return (
    <section className="panel-section">
      <h2>{t("brandAndAppearance")}</h2>
      <FormField id="brandName" label={t("logoBrand")} value={form.brandName} onChange={value => onFieldChange("brandName", value)} />
      <label>{t("logoImage")}</label>
      <div className="row tight-row">
        <button type="button" className="ghost-button" onClick={() => logoInputRef.current?.click()}>{t("uploadLogo")}</button>
        <button type="button" className="ghost-button" onClick={() => onFieldChange("logoDataUrl", "")}>{t("removeLogo")}</button>
      </div>
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
      <p className="scan-hint">{logoStatus}</p>
      <FormField id="labelTitle" label={t("title")} value={form.labelTitle} onChange={value => onFieldChange("labelTitle", value)} />
      <div className="color-grid">
        <div><FormField id="accentColor" label={t("accentColor")} type="color" value={form.accentColor} onChange={value => onFieldChange("accentColor", value)} /></div>
        <div><FormField id="backgroundColor" label={t("background")} type="color" value={form.backgroundColor} onChange={value => onFieldChange("backgroundColor", value)} /></div>
        <div><FormField id="textColor" label={t("textColor")} type="color" value={form.textColor} onChange={value => onFieldChange("textColor", value)} /></div>
        <div><FormField id="borderColor" label={t("border")} type="color" value={form.borderColor} onChange={value => onFieldChange("borderColor", value)} /></div>
      </div>
      <div className="inline-fields">
        <div><FormField id="borderWidth" label={t("borderWidth")} type="range" value={form.borderWidth} onChange={value => onFieldChange("borderWidth", value)} min={1} max={8} /></div>
        <div>
          <label htmlFor="density">{t("density")}</label>
          <select id="density" value={form.density} onChange={event => onFieldChange("density", event.target.value)}>
            <option value="comfortable">{t("comfortable")}</option>
            <option value="compact">{t("compact")}</option>
          </select>
        </div>
      </div>
      <div className="option-group">
        <h3>{t("previewSize")}</h3>
        <div className="row tight-row">
          <button type="button" onClick={onZoomIn}>{t("zoomIn")}</button>
          <button type="button" onClick={onZoomOut}>{t("zoomOut")}</button>
        </div>
      </div>
      <ToggleGroup
        title={t("visualPreferences")}
        form={form}
        onFieldChange={onFieldChange}
        items={[
          ["showQr", t("showQr")],
          ["showNote", t("showNote")],
          ["highlightRecipient", t("highlightRecipient")]
        ]}
      />
      <ToggleGroup
        title={t("logisticsFields")}
        form={form}
        onFieldChange={onFieldChange}
        items={[
          ["showOrderNo", t("showOrderNo")],
          ["showReference", t("showReference")],
          ["showWeight", t("showWeight")],
          ["showDistance", t("showDistance")],
          ["showDeliveryTime", t("showDeliveryTime")]
        ]}
      />
    </section>
  );
}
