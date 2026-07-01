import { FormField } from "./FormField";
import { CollapsibleGroup } from "./CollapsibleGroup";
import { customFieldSourceOptions, getCustomFieldSourceLabel } from "../utils/customFields";

export function ContentSection({
  form,
  t,
  batchRecords,
  activeBatchRecordId,
  batchImportMessage,
  batchInputRef,
  onFieldChange,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  onDuplicateCustomField,
  onBatchImportClick,
  onBatchFileChange,
  onBatchClear,
  onBatchTemplateDownload,
  onBatchRecordSelect,
  onBatchPrev,
  onBatchNext,
  highlightTarget,
  onFocusTarget,
  onBlurTarget
}) {
  const isActive = (...targets) => targets.includes(highlightTarget);
  const focusProps = target => ({
    onFocus: () => onFocusTarget?.(target),
    onBlur: () => onBlurTarget?.()
  });

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
      <CollapsibleGroup title={t("batchImport")} subtitle={batchRecords.length ? t("batchImportCount", { count: batchRecords.length }) : t("batchImportSubtitle")} defaultOpen>
        <div className="section-head">
          <div>
            <p className="scan-hint">{t("batchImportHint")}</p>
          </div>
          <div className="action-group">
            <button type="button" className="ghost-button" onClick={onBatchTemplateDownload}>{t("batchTemplate")}</button>
            <button type="button" className="ghost-button" onClick={onBatchImportClick}>{t("batchImportAction")}</button>
            <button type="button" className="ghost-button danger-button" onClick={onBatchClear} disabled={!batchRecords.length}>{t("batchClear")}</button>
          </div>
        </div>
        {batchImportMessage ? <p className="scan-hint">{batchImportMessage}</p> : null}
        {batchRecords.length ? (
          <>
            <div className="batch-toolbar">
              <button type="button" className="ghost-button" onClick={onBatchPrev} disabled={activeBatchRecordId === batchRecords[0]?.id}>{t("batchPrev")}</button>
              <button type="button" className="ghost-button" onClick={onBatchNext} disabled={activeBatchRecordId === batchRecords[batchRecords.length - 1]?.id}>{t("batchNext")}</button>
            </div>
            <div className="batch-record-list">
              {batchRecords.map((record, index) => (
                <button
                  key={record.id}
                  type="button"
                  className={`batch-record-card ${activeBatchRecordId === record.id ? "active" : ""}`}
                  onClick={() => onBatchRecordSelect(record.id)}
                >
                  <strong>{record.title}</strong>
                  <span>{t("batchRecordMeta", { index: index + 1, fields: Object.keys(record.raw || {}).length })}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        <input ref={batchInputRef} type="file" accept=".csv,.tsv,.json,text/csv,application/json,text/tab-separated-values" className="hidden" onChange={onBatchFileChange} />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("fieldVisibility")} subtitle={`${visibilityItems.filter(([key]) => form[key]).length} / ${visibilityItems.length}`} defaultOpen>
        <div className="toggle-grid">
          {visibilityItems.map(([key, text]) => (
            <label key={key} className="toggle">
              <input type="checkbox" checked={form[key]} onChange={event => onFieldChange(key, event.target.checked)} />
              <span>{text}</span>
            </label>
          ))}
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title={t("senderBlock")} subtitle={form.senderName || t("senderAddress")} defaultOpen={form.showSender || form.showSenderAddress}>
        {form.showSender && (
          <FormField id="senderName" label={t("labelSender")} value={form.senderName} onChange={value => onFieldChange("senderName", value)} wrapperClassName={`field-spotlight ${isActive("sender") ? "active" : ""}`} {...focusProps("sender")} />
        )}
        {form.showSenderAddress && (
          <div className={`field-spotlight ${isActive("sender") ? "active" : ""}`}>
            <label htmlFor="senderAddress">{t("senderAddress")}</label>
            <textarea id="senderAddress" value={form.senderAddress} onChange={event => onFieldChange("senderAddress", event.target.value)} {...focusProps("sender")} />
          </div>
        )}
      </CollapsibleGroup>

      <CollapsibleGroup title={t("recipientBlock")} subtitle={form.recipientName || t("recipientAddress")} defaultOpen={form.showRecipient || form.showRecipientAddress}>
        {form.showRecipient && (
          <FormField id="recipientName" label={t("labelRecipient")} value={form.recipientName} onChange={value => onFieldChange("recipientName", value)} wrapperClassName={`field-spotlight ${isActive("recipient") ? "active" : ""}`} {...focusProps("recipient")} />
        )}
        {form.showRecipientAddress && (
          <div className={`field-spotlight ${isActive("recipient") ? "active" : ""}`}>
            <label htmlFor="recipientAddress">{t("recipientAddress")}</label>
            <textarea id="recipientAddress" value={form.recipientAddress} onChange={event => onFieldChange("recipientAddress", event.target.value)} {...focusProps("recipient")} />
          </div>
        )}
      </CollapsibleGroup>

      <CollapsibleGroup title={t("logisticsFields")} subtitle={t("orderNo")} defaultOpen>
        <div className="inline-fields triple">
          <div>{form.showOrderNo && <FormField id="orderNo" label={t("orderNo")} value={form.orderNo} onChange={value => onFieldChange("orderNo", value)} wrapperClassName={`field-spotlight ${isActive("primary") ? "active" : ""}`} {...focusProps("primary")} />}</div>
          <div>{form.showReference && <FormField id="reference" label={t("reference")} value={form.reference} onChange={value => onFieldChange("reference", value)} wrapperClassName={`field-spotlight ${isActive("primary") ? "active" : ""}`} {...focusProps("primary")} />}</div>
          <div>{form.showWeight && <FormField id="weightValue" label={t("weight")} type="number" value={form.weightValue} onChange={value => onFieldChange("weightValue", value)} min={0} step={0.01} wrapperClassName={`field-spotlight ${isActive("primary") ? "active" : ""}`} {...focusProps("primary")} />}</div>
        </div>
        <div className="inline-fields triple">
          <div>
            {form.showWeight && (
              <div className={`field-spotlight ${isActive("primary") ? "active" : ""}`}>
                <label htmlFor="weightUnit">{t("weightUnit")}</label>
                <select id="weightUnit" value={form.weightUnit} onChange={event => onFieldChange("weightUnit", event.target.value)} {...focusProps("primary")}>
                  <option value="KG">KG</option>
                  <option value="G">G</option>
                  <option value="LB">LB</option>
                </select>
              </div>
            )}
          </div>
          <div>
            {form.showDistance && <FormField id="distanceValue" label={t("distance")} type="number" value={form.distanceValue} onChange={value => onFieldChange("distanceValue", value)} min={0} step={0.1} wrapperClassName={`field-spotlight ${isActive("secondary") ? "active" : ""}`} {...focusProps("secondary")} />}
          </div>
          <div>
            {form.showDistance && (
              <div className={`field-spotlight ${isActive("secondary") ? "active" : ""}`}>
                <label htmlFor="distanceUnit">{t("distanceUnit")}</label>
                <select id="distanceUnit" value={form.distanceUnit} onChange={event => onFieldChange("distanceUnit", event.target.value)} {...focusProps("secondary")}>
                  <option value="KM">KM</option>
                  <option value="MI">MI</option>
                  <option value="M">M</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title={t("deliveryType")} subtitle={t("deliveryTime")} defaultOpen={form.showDeliveryTime || form.showDeliveryType}>
        <div className="inline-fields triple">
          <div>{form.showDeliveryTime && <FormField id="deliveryTime" label={t("deliveryTime")} type="datetime-local" value={form.deliveryTime} onChange={value => onFieldChange("deliveryTime", value)} wrapperClassName={`field-spotlight ${isActive("secondary") ? "active" : ""}`} {...focusProps("secondary")} />}</div>
          <div>{form.showDeliveryType && <FormField id="deliveryType" label={t("deliveryType")} value={form.deliveryType} onChange={value => onFieldChange("deliveryType", value)} wrapperClassName={`field-spotlight ${isActive("secondary") ? "active" : ""}`} {...focusProps("secondary")} />}</div>
          <div>{form.showDeliveryType && <FormField id="deliveryWindow" label={t("deliveryWindow")} value={form.deliveryWindow} onChange={value => onFieldChange("deliveryWindow", value)} wrapperClassName={`field-spotlight ${isActive("secondary") ? "active" : ""}`} {...focusProps("secondary")} />}</div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title={t("barcode")} subtitle={form.showBarcode ? (form.barcodeText || t("barcode")) : t("note")} defaultOpen={form.showBarcode || form.showNote}>
        {form.showBarcode && (
          <FormField id="barcodeText" label={t("barcode")} value={form.barcodeText} onChange={value => onFieldChange("barcodeText", value)} placeholder={t("barcodePlaceholder")} wrapperClassName={`field-spotlight ${isActive("barcode") ? "active" : ""}`} {...focusProps("barcode")} />
        )}
        {form.showNote && (
          <div className={`field-spotlight ${isActive("footer") ? "active" : ""}`}>
            <label htmlFor="note">{t("note")}</label>
            <textarea id="note" value={form.note} onChange={event => onFieldChange("note", event.target.value)} {...focusProps("footer")} />
          </div>
        )}
      </CollapsibleGroup>

      <CollapsibleGroup title={t("customFields")} subtitle={String((form.customFields || []).length)} defaultOpen={false}>
        <div className="section-head">
          <div>
            <p className="scan-hint">{t("customFieldsHint")}</p>
          </div>
          <button type="button" className="ghost-button" onClick={onAddCustomField}>{t("addCustomField")}</button>
        </div>
        <div className="custom-fields-list">
          {(form.customFields || []).map(field => (
            <div key={field.id} className={`custom-field-card ${isActive("custom") ? "is-active" : ""}`}>
              <div className="inline-fields">
                <div>
                  <FormField
                    id={`custom-label-${field.id}`}
                    label={t("customFieldLabel")}
                    value={field.label}
                    onChange={value => onUpdateCustomField(field.id, { label: value })}
                    placeholder={t("customFieldLabelPlaceholder")}
                    wrapperClassName={`field-spotlight ${isActive("custom") ? "active" : ""}`}
                    {...focusProps("custom")}
                  />
                </div>
                <div>
                  <label htmlFor={`custom-source-${field.id}`}>{t("customFieldSource")}</label>
                  <select id={`custom-source-${field.id}`} value={field.sourceType || "manual"} onChange={event => onUpdateCustomField(field.id, { sourceType: event.target.value })} className={isActive("custom") ? "field-active-input" : ""} {...focusProps("custom")}>
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
                    wrapperClassName={`field-spotlight ${isActive("custom") ? "active" : ""}`}
                    {...focusProps("custom")}
                  />
                </div>
              </div>
              <div className="section-head compact-section-head">
                <label className="toggle">
                  <input type="checkbox" checked={field.visible !== false} onChange={event => onUpdateCustomField(field.id, { visible: event.target.checked })} />
                  <span>{t("showCustomField")}</span>
                </label>
                <div className="action-group">
                  <button type="button" className="ghost-button" onClick={() => onDuplicateCustomField?.(field.id)}>Kopyala</button>
                  <button type="button" className="ghost-button danger-button" onClick={() => onRemoveCustomField(field.id)}>{t("removeCustomField")}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleGroup>
    </section>
  );
}
