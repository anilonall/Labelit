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

export function BrandSection({ form, logoStatus, logoInputRef, onFieldChange, onLogoUpload }) {
  return (
    <section className="panel-section">
      <h2>Marka ve Gorunum</h2>
      <FormField id="brandName" label="Logo / Marka" value={form.brandName} onChange={value => onFieldChange("brandName", value)} />
      <label>Logo Gorseli</label>
      <div className="row tight-row">
        <button type="button" className="ghost-button" onClick={() => logoInputRef.current?.click()}>Logo Yukle</button>
        <button type="button" className="ghost-button" onClick={() => onFieldChange("logoDataUrl", "")}>Logo Kaldir</button>
      </div>
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
      <p className="scan-hint">{logoStatus}</p>
      <FormField id="labelTitle" label="Baslik" value={form.labelTitle} onChange={value => onFieldChange("labelTitle", value)} />
      <div className="color-grid">
        <div><FormField id="accentColor" label="Vurgu Rengi" type="color" value={form.accentColor} onChange={value => onFieldChange("accentColor", value)} /></div>
        <div><FormField id="backgroundColor" label="Zemin" type="color" value={form.backgroundColor} onChange={value => onFieldChange("backgroundColor", value)} /></div>
        <div><FormField id="textColor" label="Yazi" type="color" value={form.textColor} onChange={value => onFieldChange("textColor", value)} /></div>
        <div><FormField id="borderColor" label="Kenar" type="color" value={form.borderColor} onChange={value => onFieldChange("borderColor", value)} /></div>
      </div>
      <div className="inline-fields">
        <div><FormField id="borderWidth" label="Kenar Kalinligi" type="range" value={form.borderWidth} onChange={value => onFieldChange("borderWidth", value)} min={1} max={8} /></div>
        <div>
          <label htmlFor="density">Yogunluk</label>
          <select id="density" value={form.density} onChange={event => onFieldChange("density", event.target.value)}>
            <option value="comfortable">Rahat</option>
            <option value="compact">Kompakt</option>
          </select>
        </div>
      </div>
      <ToggleGroup
        title="Gorsel Tercihler"
        form={form}
        onFieldChange={onFieldChange}
        items={[
          ["showQr", "QR goster"],
          ["showNote", "Teslimat notu goster"],
          ["highlightRecipient", "Aliciyi vurgula"]
        ]}
      />
      <ToggleGroup
        title="Lojistik Alanlar"
        form={form}
        onFieldChange={onFieldChange}
        items={[
          ["showOrderNo", "Siparis no goster"],
          ["showReference", "Referans goster"],
          ["showWeight", "Agirlik goster"],
          ["showDistance", "Mesafe goster"],
          ["showDeliveryTime", "Teslimat zamani goster"]
        ]}
      />
    </section>
  );
}
