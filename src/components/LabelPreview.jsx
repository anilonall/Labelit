import { hexToRgba } from "../utils/colors";

export function LabelPreview({
  form,
  labelRef,
  barcodeRef,
  qrDataUrl,
  onPointerDown,
  previewTransform,
  stats
}) {
  const { weightText, distanceText, deliveryTimeText, deliveryTypeText, visiblePrimaryCount, visibleSecondaryCount } = stats;

  return (
    <section
      id="label"
      ref={labelRef}
      className={`label ${form.density === "compact" ? "compact" : ""}`}
      onPointerDown={onPointerDown}
      style={{
        width: `${form.labelWidthMm}mm`,
        height: `${form.labelHeightMm}mm`,
        maxWidth: "100%",
        backgroundColor: form.backgroundColor,
        color: form.textColor,
        borderColor: form.borderColor,
        borderWidth: `${form.borderWidth}px`,
        transform: previewTransform,
        "--recipient-accent": hexToRgba(form.accentColor, 0.14)
      }}
    >
      <div className="top">
        <div className="logo-wrap">
          {form.logoDataUrl ? <img className="logo-image" alt="Logo" src={form.logoDataUrl} /> : (
            form.brandName ? <div className="logo" style={{ color: form.accentColor }}>{form.brandName}</div> : null
          )}
        </div>
        <div className="cargo" style={{ color: form.accentColor }}>{form.labelTitle}</div>
      </div>

      {form.showSender && (
        <div className="block">
          <small>GONDEREN</small>
          <strong>{form.senderName}</strong>
          {form.showSenderAddress && <p>{form.senderAddress}</p>}
        </div>
      )}

      {form.showRecipient && (
        <div className={`block recipient ${form.highlightRecipient ? "highlighted" : ""}`} style={{ borderColor: form.highlightRecipient ? form.accentColor : "transparent" }}>
          <small>ALICI</small>
          <strong>{form.recipientName}</strong>
          {form.showRecipientAddress && <p>{form.recipientAddress}</p>}
        </div>
      )}

      <div className={`grid ${visiblePrimaryCount <= 1 ? "single-stat" : ""} ${visiblePrimaryCount === 2 ? "two-stats" : ""}`}>
        {form.showOrderNo && <div><small>SIPARIS NO</small><strong>{form.orderNo}</strong></div>}
        {form.showReference && <div><small>REFERANS</small><strong>{form.reference}</strong></div>}
        {form.showWeight && <div><small>AGIRLIK</small><strong>{weightText}</strong></div>}
      </div>

      {visibleSecondaryCount > 0 && (
        <div className={`grid secondary-grid ${visibleSecondaryCount <= 1 ? "single-stat" : ""} ${visibleSecondaryCount === 2 ? "two-stats" : ""}`}>
          {form.showDistance && <div><small>MESAFE</small><strong>{distanceText}</strong></div>}
          {form.showDeliveryTime && <div><small>TESLIMAT</small><strong>{deliveryTimeText}</strong></div>}
          {form.showDeliveryType && <div><small>TIP</small><strong>{deliveryTypeText}</strong></div>}
        </div>
      )}

      {form.showBarcode && <svg ref={barcodeRef} id="barcode"></svg>}

      {(form.showQr || form.showNote) && (
        <div className={`bottom ${!form.showQr ? "no-qr" : ""}`}>
          {form.showQr && <div id="qrcode">{qrDataUrl ? <img src={qrDataUrl} alt="QR Code" width={form.density === "compact" ? 72 : 85} height={form.density === "compact" ? 72 : 85} /> : null}</div>}
          {form.showNote && (
            <div>
              <small>TESLIMAT NOTU</small>
              <p>{form.note}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
