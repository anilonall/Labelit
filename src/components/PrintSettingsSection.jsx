import { FormField } from "./FormField";

export function PrintSettingsSection({ form, onFieldChange }) {
  return (
    <section className="panel-section">
      <h2>Baski ve Sayfa</h2>
      <div className="inline-fields">
        <div>
          <label htmlFor="printMode">Baski Modu</label>
          <select id="printMode" value={form.printMode} onChange={event => onFieldChange("printMode", event.target.value)}>
            <option value="thermal">Termal Etiket</option>
            <option value="a4">A4 Cikti</option>
          </select>
        </div>
        <div>
          <label htmlFor="sheetLayout">Yerlesim</label>
          <select id="sheetLayout" value={form.sheetLayout} onChange={event => onFieldChange("sheetLayout", event.target.value)}>
            <option value="single">Tek Etiket</option>
          </select>
        </div>
      </div>
      <div className="inline-fields triple">
        <div>
          <label htmlFor="sizePreset">Olcu Preseti</label>
          <select id="sizePreset" value={form.sizePreset} onChange={event => onFieldChange("sizePreset", event.target.value)}>
            <option value="4x6">4 x 6 inch</option>
            <option value="100x150">100 x 150 mm</option>
            <option value="a6">A6</option>
            <option value="custom">Ozel</option>
          </select>
        </div>
        <div><FormField id="labelWidthMm" label="Genislik (mm)" type="number" value={form.labelWidthMm} onChange={value => onFieldChange("labelWidthMm", value)} min={40} max={210} step={0.1} /></div>
        <div><FormField id="labelHeightMm" label="Yukseklik (mm)" type="number" value={form.labelHeightMm} onChange={value => onFieldChange("labelHeightMm", value)} min={40} max={297} step={0.1} /></div>
      </div>
      <div className="inline-fields triple">
        <div><FormField id="pageMarginTop" label="Ust Bosluk (mm)" type="number" value={form.pageMarginTop} onChange={value => onFieldChange("pageMarginTop", value)} min={0} max={40} step={1} /></div>
        <div><FormField id="pageMarginSide" label="Yan Bosluk (mm)" type="number" value={form.pageMarginSide} onChange={value => onFieldChange("pageMarginSide", value)} min={0} max={40} step={1} /></div>
        <div><FormField id="sheetGap" label="Hucre Boslugu (mm)" type="number" value={form.sheetGap} onChange={value => onFieldChange("sheetGap", value)} min={0} max={20} step={1} /></div>
      </div>
    </section>
  );
}
