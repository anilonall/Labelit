import { FormField } from "./FormField";

export function ContentSection({
  form,
  onFieldChange
}) {
  const visibilityItems = [
    ["showSender", "Gonderen blogu"],
    ["showSenderAddress", "Gonderen adresi"],
    ["showRecipient", "Alici blogu"],
    ["showRecipientAddress", "Alici adresi"],
    ["showOrderNo", "Siparis no"],
    ["showReference", "Referans"],
    ["showWeight", "Agirlik"],
    ["showDistance", "Mesafe"],
    ["showDeliveryTime", "Teslimat zamani"],
    ["showDeliveryType", "Teslimat tipi"],
    ["showBarcode", "Barkod"],
    ["showBarcodeValue", "Barkod numarasi"],
    ["showQr", "QR kod"],
    ["showNote", "Teslimat notu"]
  ];

  return (
    <section className="panel-section">
      <h2>Icerik</h2>
      <div className="option-group">
        <h3>Alan Gorunurlugu</h3>
        <div className="toggle-grid">
          {visibilityItems.map(([key, text]) => (
            <label key={key} className="toggle">
              <input type="checkbox" checked={form[key]} onChange={event => onFieldChange(key, event.target.checked)} />
              <span>{text}</span>
            </label>
          ))}
        </div>
      </div>

      {form.showSender && (
        <FormField id="senderName" label="Gonderen" value={form.senderName} onChange={value => onFieldChange("senderName", value)} />
      )}
      {form.showSenderAddress && (
        <>
          <label htmlFor="senderAddress">Gonderen Adres</label>
          <textarea id="senderAddress" value={form.senderAddress} onChange={event => onFieldChange("senderAddress", event.target.value)} />
        </>
      )}

      {form.showRecipient && (
        <FormField id="recipientName" label="Alici" value={form.recipientName} onChange={value => onFieldChange("recipientName", value)} />
      )}
      {form.showRecipientAddress && (
        <>
          <label htmlFor="recipientAddress">Alici Adres</label>
          <textarea id="recipientAddress" value={form.recipientAddress} onChange={event => onFieldChange("recipientAddress", event.target.value)} />
        </>
      )}

      <div className="inline-fields triple">
        <div>{form.showOrderNo && <FormField id="orderNo" label="Siparis No" value={form.orderNo} onChange={value => onFieldChange("orderNo", value)} />}</div>
        <div>{form.showReference && <FormField id="reference" label="Referans" value={form.reference} onChange={value => onFieldChange("reference", value)} />}</div>
        <div>{form.showWeight && <FormField id="weightValue" label="Agirlik" type="number" value={form.weightValue} onChange={value => onFieldChange("weightValue", value)} min={0} step={0.01} />}</div>
      </div>
      <div className="inline-fields triple">
        <div>
          {form.showWeight && (
            <>
              <label htmlFor="weightUnit">Agirlik Birimi</label>
              <select id="weightUnit" value={form.weightUnit} onChange={event => onFieldChange("weightUnit", event.target.value)}>
                <option value="KG">KG</option>
                <option value="G">G</option>
                <option value="LB">LB</option>
              </select>
            </>
          )}
        </div>
        <div>
          {form.showDistance && <FormField id="distanceValue" label="Mesafe" type="number" value={form.distanceValue} onChange={value => onFieldChange("distanceValue", value)} min={0} step={0.1} />}
        </div>
        <div>
          {form.showDistance && (
            <>
              <label htmlFor="distanceUnit">Mesafe Birimi</label>
              <select id="distanceUnit" value={form.distanceUnit} onChange={event => onFieldChange("distanceUnit", event.target.value)}>
                <option value="KM">KM</option>
                <option value="MI">MI</option>
                <option value="M">M</option>
              </select>
            </>
          )}
        </div>
      </div>
      <div className="inline-fields triple">
        <div>{form.showDeliveryTime && <FormField id="deliveryTime" label="Teslimat Zamani" type="datetime-local" value={form.deliveryTime} onChange={value => onFieldChange("deliveryTime", value)} />}</div>
        <div>{form.showDeliveryType && <FormField id="deliveryType" label="Teslimat Tipi" value={form.deliveryType} onChange={value => onFieldChange("deliveryType", value)} />}</div>
        <div>{form.showDeliveryType && <FormField id="deliveryWindow" label="Teslimat Suresi" value={form.deliveryWindow} onChange={value => onFieldChange("deliveryWindow", value)} />}</div>
      </div>
      {form.showBarcode && (
        <FormField id="barcodeText" label="Barkod" value={form.barcodeText} onChange={value => onFieldChange("barcodeText", value)} placeholder="Barkod degeri" />
      )}
      {form.showNote && (
        <>
          <label htmlFor="note">Teslimat Notu</label>
          <textarea id="note" value={form.note} onChange={event => onFieldChange("note", event.target.value)} />
        </>
      )}
    </section>
  );
}
