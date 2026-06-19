import { useEffect, useRef, useState } from "react";
import { normalizeLayoutItems } from "../constants/layoutItems";
import { getFontOption } from "../constants/typography";
import { hexToRgba } from "../utils/colors";

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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function EditableBlock({ itemKey, frame, onChange, children, accentColor, labelRef }) {
  const [editState, setEditState] = useState(null);

  const startDrag = event => {
    event.stopPropagation();
    const bounds = labelRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    setEditState({
      mode: "move",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: frame,
      bounds
    });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const startResize = event => {
    event.stopPropagation();
    const bounds = labelRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    setEditState({
      mode: "resize",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: frame,
      bounds
    });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleMove = event => {
    if (!editState || editState.pointerId !== event.pointerId) {
      return;
    }

    const deltaXPercent = ((event.clientX - editState.startX) / editState.bounds.width) * 100;
    const deltaYPercent = ((event.clientY - editState.startY) / editState.bounds.height) * 100;

    if (editState.mode === "move") {
      const x = clamp(editState.origin.x + deltaXPercent, 0, 100 - editState.origin.w);
      const y = clamp(editState.origin.y + deltaYPercent, 0, 100 - editState.origin.h);
      onChange(itemKey, { x, y });
      return;
    }

    const w = clamp(editState.origin.w + deltaXPercent, 12, 100 - editState.origin.x);
    const h = clamp(editState.origin.h + deltaYPercent, 8, 100 - editState.origin.y);
    onChange(itemKey, { w, h });
  };

  const stopEdit = event => {
    if (!editState || (event.pointerId !== undefined && editState.pointerId !== event.pointerId)) {
      return;
    }

    setEditState(null);
  };

  return (
    <div
      className="layout-block"
      style={{
        left: `${frame.x}%`,
        top: `${frame.y}%`,
        width: `${frame.w}%`,
        height: `${frame.h}%`,
        "--layout-accent": accentColor
      }}
      onPointerMove={handleMove}
      onPointerUp={stopEdit}
      onPointerCancel={stopEdit}
    >
      <div className="layout-block-toolbar" onPointerDown={startDrag}>
        <span className="layout-block-dots" />
      </div>
      <div className="layout-block-body">{children}</div>
      <button type="button" className="layout-resize-handle" onPointerDown={startResize} aria-label={`${itemKey}-resize`} />
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
  stats,
  onLayoutItemChange,
  onFieldChange,
  onAddCustomField,
  onRemoveCustomField
}) {
  const { weightText, distanceText, deliveryTimeText, deliveryTypeText, visiblePrimaryCount, visibleSecondaryCount } = stats;
  const horizontalTicks = buildTicks(Number(form.labelWidthMm) || 100);
  const verticalTicks = buildTicks(Number(form.labelHeightMm) || 150);
  const gridStep = Math.max(2, Number(form.gridStepMm) || 10);
  const gridColumns = Math.max(1, Number(form.labelWidthMm) / gridStep);
  const gridRows = Math.max(1, Number(form.labelHeightMm) / gridStep);
  const fontOption = getFontOption(form.fontFamily);
  const visibleCustomFields = (stats.customFields || []).filter(field => field.visible !== false && (field.label || field.value));
  const layoutItems = normalizeLayoutItems(form.layoutItems);
  const labelBodyRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("pointerdown", closeMenu);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
    };
  }, []);

  const openContextMenu = (event, items) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items
    });
  };

  const removeBuiltInCell = key => onFieldChange?.(key, false);

  return (
    <section
      id="label"
      ref={labelRef}
      className="label-stage"
      onPointerDown={onPointerDown}
      onContextMenu={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
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
        ref={labelBodyRef}
        className={`label ${form.density === "compact" ? "compact" : ""}`}
        onContextMenu={event => {
          event.preventDefault();
          event.stopPropagation();
          openContextMenu(event, [{ label: t("addCell"), action: () => onAddCustomField?.() }]);
        }}
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

        <EditableBlock itemKey="brand" frame={layoutItems.brand} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
          <div className="logo-wrap">
            {form.logoDataUrl ? <img className="logo-image" alt="Logo" src={form.logoDataUrl} /> : (
              form.brandName ? <div className="logo" style={{ color: form.accentColor }}>{form.brandName}</div> : null
            )}
          </div>
        </EditableBlock>

        <EditableBlock itemKey="title" frame={layoutItems.title} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
          <div className="cargo" style={{ color: form.accentColor }}>{form.labelTitle}</div>
        </EditableBlock>

        {form.showSender && (
          <EditableBlock itemKey="sender" frame={layoutItems.sender} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
            <div className="block free-block">
              <small>{t("labelSender")}</small>
              <strong>{form.senderName}</strong>
              {form.showSenderAddress && <p>{form.senderAddress}</p>}
            </div>
          </EditableBlock>
        )}

        {form.showRecipient && (
          <EditableBlock itemKey="recipient" frame={layoutItems.recipient} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
            <div className={`block recipient free-block ${form.highlightRecipient ? "highlighted" : ""}`} style={{ borderColor: form.highlightRecipient ? form.accentColor : "transparent" }}>
              <small>{t("labelRecipient")}</small>
              <strong>{form.recipientName}</strong>
              {form.showRecipientAddress && <p>{form.recipientAddress}</p>}
            </div>
          </EditableBlock>
        )}

        <EditableBlock itemKey="primary" frame={layoutItems.primary} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
          <div className={`grid free-grid ${visiblePrimaryCount <= 1 ? "single-stat" : ""} ${visiblePrimaryCount === 2 ? "two-stats" : ""}`}>
            {form.showOrderNo && (
              <div onContextMenu={event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell("showOrderNo") }])}>
                <small>{t("labelOrderNo")}</small><strong>{form.orderNo}</strong>
              </div>
            )}
            {form.showReference && (
              <div onContextMenu={event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell("showReference") }])}>
                <small>{t("labelReference")}</small><strong>{form.reference}</strong>
              </div>
            )}
            {form.showWeight && (
              <div onContextMenu={event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell("showWeight") }])}>
                <small>{t("labelWeight")}</small><strong>{weightText}</strong>
              </div>
            )}
          </div>
        </EditableBlock>

        {visibleSecondaryCount > 0 && (
          <EditableBlock itemKey="secondary" frame={layoutItems.secondary} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
            <div className={`grid free-grid ${visibleSecondaryCount <= 1 ? "single-stat" : ""} ${visibleSecondaryCount === 2 ? "two-stats" : ""}`}>
              {form.showDistance && (
                <div onContextMenu={event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell("showDistance") }])}>
                  <small>{t("labelDistance")}</small><strong>{distanceText}</strong>
                </div>
              )}
              {form.showDeliveryTime && (
                <div onContextMenu={event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell("showDeliveryTime") }])}>
                  <small>{t("labelDelivery")}</small><strong>{deliveryTimeText}</strong>
                </div>
              )}
              {form.showDeliveryType && (
                <div onContextMenu={event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell("showDeliveryType") }])}>
                  <small>{t("labelType")}</small><strong>{deliveryTypeText}</strong>
                </div>
              )}
            </div>
          </EditableBlock>
        )}

        {visibleCustomFields.length > 0 && (
          <EditableBlock itemKey="custom" frame={layoutItems.custom} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
            <div
              className={`grid free-grid ${visibleCustomFields.length <= 1 ? "single-stat" : ""} ${visibleCustomFields.length === 2 ? "two-stats" : ""}`}
              onContextMenu={event => openContextMenu(event, [{ label: t("addCell"), action: () => onAddCustomField?.() }])}
            >
              {visibleCustomFields.map(field => (
                <div
                  key={field.id}
                  onContextMenu={event => openContextMenu(event, [
                    { label: t("addCell"), action: () => onAddCustomField?.() },
                    { label: t("removeCell"), action: () => onRemoveCustomField?.(field.id) }
                  ])}
                >
                  <small>{field.label || t("customFieldLabel")}</small>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          </EditableBlock>
        )}

        {form.showBarcode && (
          <EditableBlock itemKey="barcode" frame={layoutItems.barcode} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
            <svg ref={barcodeRef} id="barcode" />
          </EditableBlock>
        )}

        {(form.showQr || form.showNote) && (
          <EditableBlock itemKey="footer" frame={layoutItems.footer} onChange={onLayoutItemChange} accentColor={form.accentColor} labelRef={labelBodyRef}>
            <div className={`bottom free-bottom ${!form.showQr ? "no-qr" : ""}`}>
              {form.showQr && <div id="qrcode">{qrDataUrl ? <img src={qrDataUrl} alt="QR Code" width={form.density === "compact" ? 72 : 85} height={form.density === "compact" ? 72 : 85} /> : null}</div>}
              {form.showNote && (
                <div>
                  <small>{t("labelNote")}</small>
                  <p>{form.note}</p>
                </div>
              )}
            </div>
          </EditableBlock>
        )}

      </div>
      {contextMenu && (
        <div className="preview-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={event => event.stopPropagation()}>
          {contextMenu.items.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              type="button"
              className="preview-context-item"
              onClick={() => {
                item.action?.();
                setContextMenu(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
