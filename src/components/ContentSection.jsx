import { FormField } from "./FormField";
import { customFieldSourceOptions, getCustomFieldSourceLabel } from "../utils/customFields";

export function ContentSection({
  form,
  t,
  onFieldChange,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField
}) {
  const visibilityItems = [
    ["showSender", t("senderBlock")],
    ["showSenderAddress", t("senderAddress")],
    ["showRecipient", t("recipientBlock")],
    ["showRecipientAddress", t("recipientAddress")],
    ["showOrderNo", t("orderNo")],
    ["showReference", t("reference")],
    ["showWeight", t("weight")],
    ["showDistance", t("distance")],
    ["showDeliveryTime", t("deliveryTime")],
    ["showDeliveryType", t("deliveryType")],
    ["showBarcode", t("barcode")],
    ["showBarcodeValue", t("barcodeValue")],
    ["showQr", "QR"],
    ["showNote", t("note")]
  ];

  return (
    <section className="panel-section">
      <h2>{t("content")}</h2>
      <div className="option-group">
        <h3>{t("fieldVisibility")}</h3>
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
        <FormField id="senderName" label={t("labelSender")} value={form.senderName} onChange={value => onFieldChange("senderName", value)} />
      )}
      {form.showSenderAddress && (
        <>
          <label htmlFor="senderAddress">{t("senderAddress")}</label>
          <textarea id="senderAddress" value={form.senderAddress} onChange={event => onFieldChange("senderAddress", event.target.value)} />
        </>
      )}

      {form.showRecipient && (
        <FormField id="recipientName" label={t("labelRecipient")} value={form.recipientName} onChange={value => onFieldChange("recipientName", value)} />
      )}
      {form.showRecipientAddress && (
        <>
          <label htmlFor="recipientAddress">{t("recipientAddress")}</label>
          <textarea id="recipientAddress" value={form.recipientAddress} onChange={event => onFieldChange("recipientAddress", event.target.value)} />
        </>
      )}

      <div className="inline-fields triple">
        <div>{form.showOrderNo && <FormField id="orderNo" label={t("orderNo")} value={form.orderNo} onChange={value => onFieldChange("orderNo", value)} />}</div>
        <div>{form.showReference && <FormField id="reference" label={t("reference")} value={form.reference} onChange={value => onFieldChange("reference", value)} />}</div>
        <div>{form.showWeight && <FormField id="weightValue" label={t("weight")} type="number" value={form.weightValue} onChange={value => onFieldChange("weightValue", value)} min={0} step={0.01} />}</div>
      </div>
      <div className="inline-fields triple">
        <div>
          {form.showWeight && (
            <>
              <label htmlFor="weightUnit">{t("weightUnit")}</label>
              <select id="weightUnit" value={form.weightUnit} onChange={event => onFieldChange("weightUnit", event.target.value)}>
                <option value="KG">KG</option>
                <option value="G">G</option>
                <option value="LB">LB</option>
              </select>
            </>
          )}
        </div>
        <div>
          {form.showDistance && <FormField id="distanceValue" label={t("distance")} type="number" value={form.distanceValue} onChange={value => onFieldChange("distanceValue", value)} min={0} step={0.1} />}
        </div>
        <div>
          {form.showDistance && (
            <>
              <label htmlFor="distanceUnit">{t("distanceUnit")}</label>
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
        <div>{form.showDeliveryTime && <FormField id="deliveryTime" label={t("deliveryTime")} type="datetime-local" value={form.deliveryTime} onChange={value => onFieldChange("deliveryTime", value)} />}</div>
        <div>{form.showDeliveryType && <FormField id="deliveryType" label={t("deliveryType")} value={form.deliveryType} onChange={value => onFieldChange("deliveryType", value)} />}</div>
        <div>{form.showDeliveryType && <FormField id="deliveryWindow" label={t("deliveryWindow")} value={form.deliveryWindow} onChange={value => onFieldChange("deliveryWindow", value)} />}</div>
      </div>
      {form.showBarcode && (
        <FormField id="barcodeText" label={t("barcode")} value={form.barcodeText} onChange={value => onFieldChange("barcodeText", value)} placeholder={t("barcodePlaceholder")} />
      )}
      {form.showNote && (
        <>
          <label htmlFor="note">{t("note")}</label>
          <textarea id="note" value={form.note} onChange={event => onFieldChange("note", event.target.value)} />
        </>
      )}

      <div className="option-group">
        <div className="section-head">
          <div>
            <h3>{t("customFields")}</h3>
            <p className="scan-hint">{t("customFieldsHint")}</p>
          </div>
          <button type="button" className="ghost-button" onClick={onAddCustomField}>{t("addCustomField")}</button>
        </div>
        <div className="custom-fields-list">
          {(form.customFields || []).map(field => (
            <div key={field.id} className="custom-field-card">
              <div className="inline-fields">
                <div>
                  <FormField
                    id={`custom-label-${field.id}`}
                    label={t("customFieldLabel")}
                    value={field.label}
                    onChange={value => onUpdateCustomField(field.id, { label: value })}
                    placeholder={t("customFieldLabelPlaceholder")}
                  />
                </div>
                <div>
                  <label htmlFor={`custom-source-${field.id}`}>{t("customFieldSource")}</label>
                  <select id={`custom-source-${field.id}`} value={field.sourceType || "manual"} onChange={event => onUpdateCustomField(field.id, { sourceType: event.target.value })}>
                    {customFieldSourceOptions.map(option => (
                      <option key={option.key} value={option.key}>{getCustomFieldSourceLabel(option.key, form.uiLanguage)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="inline-fields">
                <div>
                  <FormField
                    id={`custom-value-${field.id}`}
                    label={t("customFieldValue")}
                    value={field.value}
                    onChange={value => onUpdateCustomField(field.id, { value })}
                    placeholder={t("customFieldValuePlaceholder")}
                    disabled={(field.sourceType || "manual") !== "manual"}
                  />
                </div>
              </div>
              <div className="section-head compact-section-head">
                <label className="toggle">
                  <input type="checkbox" checked={field.visible !== false} onChange={event => onUpdateCustomField(field.id, { visible: event.target.checked })} />
                  <span>{t("showCustomField")}</span>
                </label>
                <button type="button" className="ghost-button danger-button" onClick={() => onRemoveCustomField(field.id)}>{t("removeCustomField")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
