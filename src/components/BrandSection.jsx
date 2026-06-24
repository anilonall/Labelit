import { FormField } from "./FormField";
import { CollapsibleGroup } from "./CollapsibleGroup";
import { fontFamilyOptions } from "../constants/typography";

function ToggleGroup({ title, items, form, onFieldChange, hideTitle = false }) {
  return (
    <div className="option-group">
      {!hideTitle ? <h3>{title}</h3> : null}
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

export function BrandSection({ form, t, logoStatus, logoInputRef, onFieldChange, onLogoUpload, highlightTarget, onFocusTarget, onBlurTarget }) {
  const isActive = target => highlightTarget === target;
  const focusProps = target => ({
    onFocus: () => onFocusTarget?.(target),
    onBlur: () => onBlurTarget?.()
  });

  return (
    <section className="panel-section">
      <h2>{t("brandAndAppearance")}</h2>
      <CollapsibleGroup title={t("logoBrand")} subtitle={form.brandName || t("title")} defaultOpen>
        <FormField id="brandName" label={t("logoBrand")} value={form.brandName} onChange={value => onFieldChange("brandName", value)} wrapperClassName={`field-spotlight ${isActive("brand") ? "active" : ""}`} {...focusProps("brand")} />
        <label>{t("logoImage")}</label>
        <div className="row tight-row">
          <button type="button" className="ghost-button" onClick={() => logoInputRef.current?.click()}>{t("uploadLogo")}</button>
          <button type="button" className="ghost-button" onClick={() => onFieldChange("logoDataUrl", "")}>{t("removeLogo")}</button>
        </div>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
        <p className="scan-hint">{logoStatus}</p>
        <FormField id="labelTitle" label={t("title")} value={form.labelTitle} onChange={value => onFieldChange("labelTitle", value)} wrapperClassName={`field-spotlight ${isActive("title") ? "active" : ""}`} {...focusProps("title")} />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("visualPreferences")} subtitle={t("accentColor")} defaultOpen>
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
      </CollapsibleGroup>

      <CollapsibleGroup title={t("typography")} subtitle={t("fontFamily")} defaultOpen={false}>
        <label htmlFor="fontFamily">{t("fontFamily")}</label>
        <select id="fontFamily" value={form.fontFamily} onChange={event => onFieldChange("fontFamily", event.target.value)}>
          {fontFamilyOptions.map(option => (
            <option key={option.key} value={option.key}>{option.label}</option>
          ))}
        </select>
        <div className="inline-fields double-stack">
          <div><FormField id="brandFontSize" label={t("brandFontSize")} type="number" value={form.brandFontSize} onChange={value => onFieldChange("brandFontSize", value)} min={12} max={72} step={1} /></div>
          <div><FormField id="titleFontSize" label={t("titleFontSize")} type="number" value={form.titleFontSize} onChange={value => onFieldChange("titleFontSize", value)} min={8} max={36} step={1} /></div>
          <div><FormField id="headingFontSize" label={t("headingFontSize")} type="number" value={form.headingFontSize} onChange={value => onFieldChange("headingFontSize", value)} min={7} max={24} step={1} /></div>
          <div><FormField id="bodyFontSize" label={t("bodyFontSize")} type="number" value={form.bodyFontSize} onChange={value => onFieldChange("bodyFontSize", value)} min={8} max={36} step={1} /></div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title={t("visualPreferences")} subtitle="QR / Note" compact>
        <ToggleGroup
        title={t("visualPreferences")}
        form={form}
        onFieldChange={onFieldChange}
        hideTitle
        items={[
          ["showQr", t("showQr")],
          ["showNote", t("showNote")],
            ["highlightRecipient", t("highlightRecipient")]
          ]}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("logisticsFields")} subtitle={t("showOrderNo")} compact>
        <ToggleGroup
        title={t("logisticsFields")}
        form={form}
        onFieldChange={onFieldChange}
        hideTitle
        items={[
          ["showOrderNo", t("showOrderNo")],
          ["showReference", t("showReference")],
            ["showWeight", t("showWeight")],
            ["showDistance", t("showDistance")],
            ["showDeliveryTime", t("showDeliveryTime")]
          ]}
        />
      </CollapsibleGroup>
    </section>
  );
}
