import { FormField } from "./FormField";

export function ContentSection({
  form,
  scannerInput,
  scannerInputRef,
  onFieldChange,
  onScannerInput,
  onScannerCommit,
  onClearBarcode
}) {
  return (
    <section className="panel-section">
      <h2>Icerik</h2>
      <FormField id="senderName" label="Gonderen" value={form.senderName} onChange={value => onFieldChange("senderName", value)} />
      <label htmlFor="senderAddress">Gonderen Adres</label>
      <textarea id="senderAddress" value={form.senderAddress} onChange={event => onFieldChange("senderAddress", event.target.value)} />
      <FormField id="recipientName" label="Alici" value={form.recipientName} onChange={value => onFieldChange("recipientName", value)} />
      <label htmlFor="recipientAddress">Alici Adres</label>
      <textarea id="recipientAddress" value={form.recipientAddress} onChange={event => onFieldChange("recipientAddress", event.target.value)} />
      <div className="inline-fields triple">
        <div><FormField id="orderNo" label="Siparis No" value={form.orderNo} onChange={value => onFieldChange("orderNo", value)} /></div>
        <div><FormField id="reference" label="Referans" value={form.reference} onChange={value => onFieldChange("reference", value)} /></div>
        <div><FormField id="weightValue" label="Agirlik" type="number" value={form.weightValue} onChange={value => onFieldChange("weightValue", value)} min={0} step={0.01} /></div>
      </div>
      <div className="inline-fields triple">
        <div>
          <label htmlFor="weightUnit">Agirlik Birimi</label>
          <select id="weightUnit" value={form.weightUnit} onChange={event => onFieldChange("weightUnit", event.target.value)}>
            <option value="KG">KG</option>
            <option value="G">G</option>
            <option value="LB">LB</option>
          </select>
        </div>
        <div><FormField id="distanceValue" label="Mesafe" type="number" value={form.distanceValue} onChange={value => onFieldChange("distanceValue", value)} min={0} step={0.1} /></div>
        <div>
          <label htmlFor="distanceUnit">Mesafe Birimi</label>
          <select id="distanceUnit" value={form.distanceUnit} onChange={event => onFieldChange("distanceUnit", event.target.value)}>
            <option value="KM">KM</option>
            <option value="MI">MI</option>
            <option value="M">M</option>
          </select>
        </div>
      </div>
      <div className="inline-fields triple">
        <div><FormField id="deliveryTime" label="Teslimat Zamani" type="datetime-local" value={form.deliveryTime} onChange={value => onFieldChange("deliveryTime", value)} /></div>
        <div><FormField id="deliveryType" label="Teslimat Tipi" value={form.deliveryType} onChange={value => onFieldChange("deliveryType", value)} /></div>
        <div><FormField id="deliveryWindow" label="Teslimat Suresi" value={form.deliveryWindow} onChange={value => onFieldChange("deliveryWindow", value)} /></div>
      </div>
      <div className="scan-card">
        <div className="scan-head">
          <label htmlFor="barcodeScannerInput">Barkod Okut</label>
          <div className="scan-actions">
            <button className="ghost-button" type="button" onClick={() => scannerInputRef.current?.focus()}>Okutucuya Hazirla</button>
            <button className="ghost-button" type="button" onClick={onClearBarcode}>Temizle</button>
          </div>
        </div>
        <input
          id="barcodeScannerInput"
          ref={scannerInputRef}
          value={scannerInput}
          placeholder="Okutucuyu buraya okutun"
          autoComplete="off"
          onChange={event => onScannerInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              onScannerCommit();
            }
          }}
        />
        <p className="scan-hint">Barkod okuyucu veriyi yazinca etiket, QR ve PDF otomatik ayni degerle guncellenir.</p>
        <div className="scan-result">
          <small>Okunan Barkod</small>
          <strong>{form.barcodeText || "Barkod bekleniyor"}</strong>
        </div>
      </div>
      <label htmlFor="note">Teslimat Notu</label>
      <textarea id="note" value={form.note} onChange={event => onFieldChange("note", event.target.value)} />
    </section>
  );
}
