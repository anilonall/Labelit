import { hexToRgba } from "../utils/colors";
import { getFontOption } from "../constants/typography";

const RULER_GUTTER = 24;

function buildTicks(lengthMm) {
  const tickCount = Math.max(1, Math.floor(lengthMm / 5));
  return Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = index * 5;
    const ratio = Math.min(100, (value / lengthMm) * 100);
    return { value, ratio };
  });
}

function Ruler({ ticks, orientation, label, accentColor }) {
  return (
    <div className={`ruler ruler-${orientation}`}>
      <span className="ruler-label" style={{ color: accentColor }}>{label}</span>
      {ticks.map(tick => {
        const major = tick.value % 10 === 0;
        const showValue = tick.value !== 0 && tick.value % 20 === 0;

        return (
          <div
            key={`${orientation}-${tick.value}`}
            className={`ruler-tick ${major ? "major" : "minor"}`}
            style={orientation === "horizontal" ? { left: `${tick.ratio}%` } : { top: `${tick.ratio}%` }}
          >
            {showValue && <span className="ruler-value">{tick.value}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function LabelPreview({
  form,
  t,
  labelRef,
  barcodeRef,
  qrDataUrl,
  onPointerDown,
  previewTransform,
  stats
}) {
  const { weightText, distanceText, deliveryTimeText, deliveryTypeText, visiblePrimaryCount, visibleSecondaryCount } = stats;
  const horizontalTicks = buildTicks(Number(form.labelWidthMm) || 100);
  const verticalTicks = buildTicks(Number(form.labelHeightMm) || 150);
  const gridStep = Math.max(2, Number(form.gridStepMm) || 10);
  const gridColumns = Math.max(1, Number(form.labelWidthMm) / gridStep);
  const gridRows = Math.max(1, Number(form.labelHeightMm) / gridStep);
  const fontOption = getFontOption(form.fontFamily);

  return (
    <section
      id="label"
      ref={labelRef}
      className="label-stage"
      onPointerDown={onPointerDown}
      style={{
        transform: previewTransform,
        width: `calc(${form.labelWidthMm}mm + ${RULER_GUTTER}px)`,
        height: `calc(${form.labelHeightMm}mm + ${RULER_GUTTER}px)`
      }}
    >
      {form.showRulers && (
        <>
          <Ruler ticks={horizontalTicks} orientation="horizontal" label="mm" accentColor={form.accentColor} />
          <Ruler ticks={verticalTicks} orientation="vertical" label="mm" accentColor={form.accentColor} />
        </>
      )}

      <div
        className={`label ${form.density === "compact" ? "compact" : ""}`}
        style={{
          width: `${form.labelWidthMm}mm`,
          height: `${form.labelHeightMm}mm`,
          maxWidth: "100%",
          backgroundColor: form.backgroundColor,
          color: form.textColor,
          borderColor: form.borderColor,
          borderWidth: `${form.borderWidth}px`,
          "--recipient-accent": hexToRgba(form.accentColor, 0.14),
          "--label-font-family": fontOption.css,
          "--brand-font-size": `${form.brandFontSize}px`,
          "--title-font-size": `${form.titleFontSize}px`,
          "--heading-font-size": `${form.headingFontSize}px`,
          "--body-font-size": `${form.bodyFontSize}px`
        }}
      >
        {form.showGridOverlay && (
          <div
            className="label-grid-overlay"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  to right,
                  rgba(15, 23, 42, 0.08) 0,
                  rgba(15, 23, 42, 0.08) 1px,
                  transparent 1px,
                  transparent calc(100% / ${gridColumns})
                ),
                repeating-linear-gradient(
                  to bottom,
                  rgba(15, 23, 42, 0.08) 0,
                  rgba(15, 23, 42, 0.08) 1px,
                  transparent 1px,
                  transparent calc(100% / ${gridRows})
                )
              `
            }}
          />
        )}
        {form.showCenterGuides && (
          <>
            <div className="label-center-guide horizontal" />
            <div className="label-center-guide vertical" />
          </>
        )}

        <div className="label-measure-badge">
          {Math.round(Number(form.labelWidthMm))} x {Math.round(Number(form.labelHeightMm))} mm
        </div>

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
            <small>{t("labelSender")}</small>
            <strong>{form.senderName}</strong>
            {form.showSenderAddress && <p>{form.senderAddress}</p>}
          </div>
        )}

        {form.showRecipient && (
          <div className={`block recipient ${form.highlightRecipient ? "highlighted" : ""}`} style={{ borderColor: form.highlightRecipient ? form.accentColor : "transparent" }}>
            <small>{t("labelRecipient")}</small>
            <strong>{form.recipientName}</strong>
            {form.showRecipientAddress && <p>{form.recipientAddress}</p>}
          </div>
        )}

        <div className={`grid ${visiblePrimaryCount <= 1 ? "single-stat" : ""} ${visiblePrimaryCount === 2 ? "two-stats" : ""}`}>
          {form.showOrderNo && <div><small>{t("labelOrderNo")}</small><strong>{form.orderNo}</strong></div>}
          {form.showReference && <div><small>{t("labelReference")}</small><strong>{form.reference}</strong></div>}
          {form.showWeight && <div><small>{t("labelWeight")}</small><strong>{weightText}</strong></div>}
        </div>

        {visibleSecondaryCount > 0 && (
          <div className={`grid secondary-grid ${visibleSecondaryCount <= 1 ? "single-stat" : ""} ${visibleSecondaryCount === 2 ? "two-stats" : ""}`}>
            {form.showDistance && <div><small>{t("labelDistance")}</small><strong>{distanceText}</strong></div>}
            {form.showDeliveryTime && <div><small>{t("labelDelivery")}</small><strong>{deliveryTimeText}</strong></div>}
            {form.showDeliveryType && <div><small>{t("labelType")}</small><strong>{deliveryTypeText}</strong></div>}
          </div>
        )}

        {form.showBarcode && <svg ref={barcodeRef} id="barcode"></svg>}

        {(form.showQr || form.showNote) && (
          <div className={`bottom ${!form.showQr ? "no-qr" : ""}`}>
            {form.showQr && <div id="qrcode">{qrDataUrl ? <img src={qrDataUrl} alt="QR Code" width={form.density === "compact" ? 72 : 85} height={form.density === "compact" ? 72 : 85} /> : null}</div>}
            {form.showNote && (
              <div>
                <small>{t("labelNote")}</small>
                <p>{form.note}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
