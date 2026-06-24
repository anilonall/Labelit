import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { normalizeLayoutItems } from "../constants/layoutItems";
import { getFontOption } from "../constants/typography";
import { hexToRgba } from "../utils/colors";

const RULER_GUTTER = 24;

function buildMenuLabels(language) {
  const labelsByLanguage = {
    tr: {
      general: "Genel",
      people: "Kisi",
      shipment: "Sevkiyat",
      delivery: "Teslimat",
      location: "Konum",
      custom: "Ozel Alanlar",
      addCustomField: "Yeni ozel alan ekle",
      senderBlock: "Gonderen alani",
      recipientBlock: "Alici alani",
      senderAddress: "Gonderen adresi",
      recipientAddress: "Alici adresi",
      recipientHighlight: "Aliciyi vurgula",
      barcodeValue: "Barkod degeri",
      barcodeBlock: "Barkod alani",
      footerBlock: "QR / Not alani",
      customBlock: "Ozel alan blogu",
      titleBlock: "Baslik alani",
      brandBlock: "Logo / Marka alani",
      active: "Acik",
      hidden: "Kapali",
      submenu: "Alt alanlar",
      removeThis: "Bu alani kaldir"
    },
    en: {
      general: "General",
      people: "People",
      shipment: "Shipment",
      delivery: "Delivery",
      location: "Location",
      custom: "Custom Fields",
      addCustomField: "Add custom field",
      senderBlock: "Sender block",
      recipientBlock: "Recipient block",
      senderAddress: "Sender address",
      recipientAddress: "Recipient address",
      recipientHighlight: "Highlight recipient",
      barcodeValue: "Barcode value",
      barcodeBlock: "Barcode block",
      footerBlock: "QR / note block",
      customBlock: "Custom fields block",
      titleBlock: "Title block",
      brandBlock: "Logo / brand block",
      active: "On",
      hidden: "Off",
      submenu: "More fields",
      removeThis: "Remove this area"
    },
    de: {
      general: "Allgemein",
      people: "Personen",
      shipment: "Versand",
      delivery: "Lieferung",
      location: "Standort",
      custom: "Benutzerdefinierte Felder",
      addCustomField: "Benutzerdefiniertes Feld hinzufugen",
      senderBlock: "Absenderbereich",
      recipientBlock: "Empfangerbereich",
      senderAddress: "Absenderadresse",
      recipientAddress: "Empfangeradresse",
      recipientHighlight: "Empfanger hervorheben",
      barcodeValue: "Barcode-Wert",
      barcodeBlock: "Barcode-Bereich",
      footerBlock: "QR- / Notizbereich",
      customBlock: "Block fur Zusatzfelder",
      titleBlock: "Titelbereich",
      brandBlock: "Logo- / Markenbereich",
      active: "An",
      hidden: "Aus",
      submenu: "Weitere Felder",
      removeThis: "Diesen Bereich entfernen"
    },
    es: {
      general: "General",
      people: "Personas",
      shipment: "Envio",
      delivery: "Entrega",
      location: "Ubicacion",
      custom: "Campos personalizados",
      addCustomField: "Agregar campo personalizado",
      senderBlock: "Bloque del remitente",
      recipientBlock: "Bloque del destinatario",
      senderAddress: "Direccion del remitente",
      recipientAddress: "Direccion del destinatario",
      recipientHighlight: "Resaltar destinatario",
      barcodeValue: "Valor del codigo de barras",
      barcodeBlock: "Bloque del codigo de barras",
      footerBlock: "Bloque QR / nota",
      customBlock: "Bloque de campos personalizados",
      titleBlock: "Bloque del titulo",
      brandBlock: "Bloque de logo / marca",
      active: "Activo",
      hidden: "Oculto",
      submenu: "Mas campos",
      removeThis: "Quitar esta area"
    },
    fr: {
      general: "General",
      people: "Personnes",
      shipment: "Expedition",
      delivery: "Livraison",
      location: "Emplacement",
      custom: "Champs personnalises",
      addCustomField: "Ajouter un champ personnalise",
      senderBlock: "Bloc expediteur",
      recipientBlock: "Bloc destinataire",
      senderAddress: "Adresse expediteur",
      recipientAddress: "Adresse destinataire",
      recipientHighlight: "Mettre en valeur le destinataire",
      barcodeValue: "Valeur du code-barres",
      barcodeBlock: "Bloc code-barres",
      footerBlock: "Bloc QR / note",
      customBlock: "Bloc des champs personnalises",
      titleBlock: "Bloc du titre",
      brandBlock: "Bloc logo / marque",
      active: "Actif",
      hidden: "Masque",
      submenu: "Plus de champs",
      removeThis: "Supprimer cette zone"
    }
  };

  return labelsByLanguage[language] || labelsByLanguage.en;
}

function ensureMenuFit(x, y) {
  if (typeof window === "undefined") {
    return { x, y };
  }

  const menuWidth = 280;
  const menuHeight = 360;

  return {
    x: Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8)),
    y: Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8))
  };
}

function ContextMenuList({ items, level = 0, onClose }) {
  return (
    <div className={`preview-context-level ${level > 0 ? "submenu" : "root"}`}>
      {items.map((item, index) => {
        if (item.type === "divider") {
          return <div key={`divider-${level}-${index}`} className="preview-context-divider" />;
        }

        if (item.children?.length) {
          return (
            <div key={`${item.label}-${level}-${index}`} className="preview-context-group">
              <button type="button" className="preview-context-item preview-context-parent">
                <span>{item.label}</span>
                <span className="preview-context-caret">›</span>
              </button>
              <ContextMenuList items={item.children} level={level + 1} onClose={onClose} />
            </div>
          );
        }

        return (
          <button
            key={`${item.label}-${level}-${index}`}
            type="button"
            className={`preview-context-item ${item.active ? "is-active" : ""}`}
            onClick={() => {
              if (item.disabled) {
                return;
              }
              item.action?.();
              onClose?.();
            }}
          >
            <span>{item.label}</span>
            <span className={`preview-context-state ${item.active ? "is-active" : ""}`}>
              {item.stateLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

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

function EditableBlock({ itemKey, frame, onChange, children, accentColor, labelRef, selected, onSelect, onContextMenu }) {
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
      className={`layout-block ${selected ? "selected" : ""}`}
      style={{
        left: `${frame.x}%`,
        top: `${frame.y}%`,
        width: `${frame.w}%`,
        height: `${frame.h}%`,
        "--layout-accent": accentColor
      }}
      onPointerDown={event => {
        onSelect?.(itemKey);
      }}
      onClick={event => {
        event.stopPropagation();
        onSelect?.(itemKey);
      }}
      onContextMenu={event => {
        event.preventDefault();
        event.stopPropagation();
        onSelect?.(itemKey);
        onContextMenu?.(event);
      }}
      onPointerMove={handleMove}
      onPointerUp={stopEdit}
      onPointerCancel={stopEdit}
    >
      {selected && (
        <div className="layout-block-toolbar" onPointerDown={startDrag}>
          <span className="layout-block-dots" />
        </div>
      )}
      <div className="layout-block-body">{children}</div>
      {selected && (
        <button type="button" className="layout-resize-handle" onPointerDown={startResize} aria-label={`${itemKey}-resize`} />
      )}
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
  onRemoveCustomField,
  activeInspectorTarget,
  onInspectTargetChange
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
  const menuLabels = buildMenuLabels(form.uiLanguage);
  const labelBodyRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const selectItem = itemKey => {
    setSelectedItem(itemKey);
    onInspectTargetChange?.(itemKey);
  };

  useEffect(() => {
    const closeMenu = event => {
      if (event.button === 2) {
        return;
      }
      setContextMenu(null);
    };
    window.addEventListener("pointerdown", closeMenu);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
    };
  }, []);

  const openContextMenu = (event, items) => {
    event.preventDefault();
    event.stopPropagation();
    const position = ensureMenuFit(event.clientX, event.clientY);
    setContextMenu({
      x: position.x,
      y: position.y,
      items
    });
  };

  const buildToggleItem = (label, active, action) => ({
    label,
    action,
    active,
    stateLabel: active ? menuLabels.active : menuLabels.hidden
  });

  const buildMenuTree = ({ removeAction } = {}) => {
    const items = [];

    if (removeAction) {
      items.push({ label: menuLabels.removeThis, action: removeAction });
      items.push({ type: "divider" });
    }

    items.push(
      {
        label: menuLabels.general,
        children: [
          buildToggleItem(menuLabels.brandBlock, layoutItems.brand.visible !== false, () => onLayoutItemChange?.("brand", { visible: layoutItems.brand.visible === false })),
          buildToggleItem(menuLabels.titleBlock, layoutItems.title.visible !== false, () => onLayoutItemChange?.("title", { visible: layoutItems.title.visible === false })),
          buildToggleItem(menuLabels.barcodeBlock, layoutItems.barcode.visible !== false, () => onLayoutItemChange?.("barcode", { visible: layoutItems.barcode.visible === false })),
          buildToggleItem(menuLabels.footerBlock, layoutItems.footer.visible !== false, () => onLayoutItemChange?.("footer", { visible: layoutItems.footer.visible === false })),
          buildToggleItem(menuLabels.customBlock, layoutItems.custom.visible !== false, () => onLayoutItemChange?.("custom", { visible: layoutItems.custom.visible === false }))
        ]
      },
      {
        label: menuLabels.people,
        children: [
          buildToggleItem(menuLabels.senderBlock, form.showSender && layoutItems.sender.visible !== false, () => {
            onFieldChange?.("showSender", !form.showSender);
            onLayoutItemChange?.("sender", { visible: !form.showSender });
          }),
          buildToggleItem(menuLabels.senderAddress, form.showSenderAddress, () => onFieldChange?.("showSenderAddress", !form.showSenderAddress)),
          buildToggleItem(menuLabels.recipientBlock, form.showRecipient && layoutItems.recipient.visible !== false, () => {
            onFieldChange?.("showRecipient", !form.showRecipient);
            onLayoutItemChange?.("recipient", { visible: !form.showRecipient });
          }),
          buildToggleItem(menuLabels.recipientAddress, form.showRecipientAddress, () => onFieldChange?.("showRecipientAddress", !form.showRecipientAddress)),
          buildToggleItem(menuLabels.recipientHighlight, form.highlightRecipient, () => onFieldChange?.("highlightRecipient", !form.highlightRecipient))
        ]
      },
      {
        label: menuLabels.shipment,
        children: [
          buildToggleItem(t("labelOrderNo"), form.showOrderNo, () => onFieldChange?.("showOrderNo", !form.showOrderNo)),
          buildToggleItem(t("labelReference"), form.showReference, () => onFieldChange?.("showReference", !form.showReference)),
          buildToggleItem(t("labelWeight"), form.showWeight, () => onFieldChange?.("showWeight", !form.showWeight)),
          buildToggleItem(menuLabels.barcodeValue, form.showBarcodeValue, () => onFieldChange?.("showBarcodeValue", !form.showBarcodeValue))
        ]
      },
      {
        label: menuLabels.delivery,
        children: [
          buildToggleItem(t("labelDistance"), form.showDistance, () => onFieldChange?.("showDistance", !form.showDistance)),
          buildToggleItem(t("labelDelivery"), form.showDeliveryTime, () => onFieldChange?.("showDeliveryTime", !form.showDeliveryTime)),
          buildToggleItem(t("labelType"), form.showDeliveryType, () => onFieldChange?.("showDeliveryType", !form.showDeliveryType)),
          buildToggleItem(t("note"), form.showNote, () => onFieldChange?.("showNote", !form.showNote))
        ]
      },
      {
        label: menuLabels.location,
        children: [
          buildToggleItem("QR", form.showQr, () => onFieldChange?.("showQr", !form.showQr)),
          buildToggleItem(t("labelDistance"), form.showDistance, () => onFieldChange?.("showDistance", !form.showDistance))
        ]
      },
      {
        label: menuLabels.custom,
        children: [
          buildToggleItem(t("customFields"), layoutItems.custom.visible !== false, () => onLayoutItemChange?.("custom", { visible: layoutItems.custom.visible === false })),
          { label: menuLabels.addCustomField, action: () => onAddCustomField?.(), stateLabel: menuLabels.submenu }
        ]
      }
    );

    return items;
  };

  const openAddMenu = event => {
    openContextMenu(event, buildMenuTree());
  };

  const removeBuiltInCell = key => onFieldChange?.(key, false);
  const buildRemoveMenu = key => event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell(key) }]);
  const buildHideBlockMenu = blockKey => event => openContextMenu(event, buildMenuTree({
    removeAction: () => onLayoutItemChange?.(blockKey, { visible: false })
  }));

  return (
    <section
      id="label"
      ref={labelRef}
      className="label-stage"
      onPointerDown={event => {
        if (event.button === 0) {
          setSelectedItem(null);
          onInspectTargetChange?.(null);
          onPointerDown?.(event);
        }
      }}
      style={{
        transform: previewTransform,
        width: `calc(${form.labelWidthMm}mm + ${RULER_GUTTER}px)`,
        height: `calc(${form.labelHeightMm}mm + ${RULER_GUTTER}px)`
      }}
    >
      <button
        type="button"
        className="label-stage-drag-handle"
        onPointerDown={event => {
          event.stopPropagation();
          onPointerDown?.(event);
        }}
        aria-label="move-label"
        title="Move label"
      >
        <span className="label-stage-drag-dots" />
      </button>

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
          setSelectedItem(null);
          onInspectTargetChange?.(null);
          openAddMenu(event);
        }}
        onClick={() => {
          setSelectedItem(null);
          onInspectTargetChange?.(null);
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

        {layoutItems.brand.visible !== false && (
        <EditableBlock
          itemKey="brand"
          frame={layoutItems.brand}
          onChange={onLayoutItemChange}
          accentColor={form.accentColor}
          labelRef={labelBodyRef}
          selected={selectedItem === "brand" || activeInspectorTarget === "brand"}
          onSelect={selectItem}
          onContextMenu={buildHideBlockMenu("brand")}
        >
          <div className="logo-wrap">
            {form.logoDataUrl ? <img className="logo-image" alt="Logo" src={form.logoDataUrl} /> : (
              form.brandName ? <div className="logo" style={{ color: form.accentColor }}>{form.brandName}</div> : null
            )}
          </div>
        </EditableBlock>
        )}

        {layoutItems.title.visible !== false && (
        <EditableBlock
          itemKey="title"
          frame={layoutItems.title}
          onChange={onLayoutItemChange}
          accentColor={form.accentColor}
          labelRef={labelBodyRef}
          selected={selectedItem === "title" || activeInspectorTarget === "title"}
          onSelect={selectItem}
          onContextMenu={buildHideBlockMenu("title")}
        >
          <div className="cargo" style={{ color: form.accentColor }}>{form.labelTitle}</div>
        </EditableBlock>
        )}

        {form.showSender && layoutItems.sender.visible !== false && (
          <EditableBlock
            itemKey="sender"
            frame={layoutItems.sender}
            onChange={onLayoutItemChange}
            accentColor={form.accentColor}
            labelRef={labelBodyRef}
            selected={selectedItem === "sender" || activeInspectorTarget === "sender"}
            onSelect={selectItem}
            onContextMenu={buildHideBlockMenu("sender")}
          >
            <div className="block free-block">
              <small>{t("labelSender")}</small>
              <strong>{form.senderName}</strong>
              {form.showSenderAddress && <p>{form.senderAddress}</p>}
            </div>
          </EditableBlock>
        )}

        {form.showRecipient && layoutItems.recipient.visible !== false && (
          <EditableBlock
            itemKey="recipient"
            frame={layoutItems.recipient}
            onChange={onLayoutItemChange}
            accentColor={form.accentColor}
            labelRef={labelBodyRef}
            selected={selectedItem === "recipient" || activeInspectorTarget === "recipient"}
            onSelect={selectItem}
            onContextMenu={buildHideBlockMenu("recipient")}
          >
            <div className={`block recipient free-block ${form.highlightRecipient ? "highlighted" : ""}`} style={{ borderColor: form.highlightRecipient ? form.accentColor : "transparent" }}>
              <small>{t("labelRecipient")}</small>
              <strong>{form.recipientName}</strong>
              {form.showRecipientAddress && <p>{form.recipientAddress}</p>}
            </div>
          </EditableBlock>
        )}

        {layoutItems.primary.visible !== false && (
        <EditableBlock
          itemKey="primary"
          frame={layoutItems.primary}
          onChange={onLayoutItemChange}
          accentColor={form.accentColor}
          labelRef={labelBodyRef}
          selected={selectedItem === "primary" || activeInspectorTarget === "primary"}
          onSelect={selectItem}
          onContextMenu={buildHideBlockMenu("primary")}
        >
          <div className={`grid free-grid ${visiblePrimaryCount <= 1 ? "single-stat" : ""} ${visiblePrimaryCount === 2 ? "two-stats" : ""}`}>
            {form.showOrderNo && (
              <div onContextMenu={buildRemoveMenu("showOrderNo")} onContextMenuCapture={event => event.stopPropagation()}>
                <small>{t("labelOrderNo")}</small><strong>{form.orderNo}</strong>
              </div>
            )}
            {form.showReference && (
              <div onContextMenu={buildRemoveMenu("showReference")} onContextMenuCapture={event => event.stopPropagation()}>
                <small>{t("labelReference")}</small><strong>{form.reference}</strong>
              </div>
            )}
            {form.showWeight && (
              <div onContextMenu={buildRemoveMenu("showWeight")} onContextMenuCapture={event => event.stopPropagation()}>
                <small>{t("labelWeight")}</small><strong>{weightText}</strong>
              </div>
            )}
          </div>
        </EditableBlock>
        )}

        {visibleSecondaryCount > 0 && layoutItems.secondary.visible !== false && (
          <EditableBlock
            itemKey="secondary"
            frame={layoutItems.secondary}
            onChange={onLayoutItemChange}
            accentColor={form.accentColor}
            labelRef={labelBodyRef}
            selected={selectedItem === "secondary" || activeInspectorTarget === "secondary"}
            onSelect={selectItem}
            onContextMenu={buildHideBlockMenu("secondary")}
          >
            <div className={`grid free-grid ${visibleSecondaryCount <= 1 ? "single-stat" : ""} ${visibleSecondaryCount === 2 ? "two-stats" : ""}`}>
              {form.showDistance && (
                <div onContextMenu={buildRemoveMenu("showDistance")} onContextMenuCapture={event => event.stopPropagation()}>
                  <small>{t("labelDistance")}</small><strong>{distanceText}</strong>
                </div>
              )}
              {form.showDeliveryTime && (
                <div onContextMenu={buildRemoveMenu("showDeliveryTime")} onContextMenuCapture={event => event.stopPropagation()}>
                  <small>{t("labelDelivery")}</small><strong>{deliveryTimeText}</strong>
                </div>
              )}
              {form.showDeliveryType && (
                <div onContextMenu={buildRemoveMenu("showDeliveryType")} onContextMenuCapture={event => event.stopPropagation()}>
                  <small>{t("labelType")}</small><strong>{deliveryTypeText}</strong>
                </div>
              )}
            </div>
          </EditableBlock>
        )}

        {visibleCustomFields.length > 0 && layoutItems.custom.visible !== false && (
          <EditableBlock
            itemKey="custom"
            frame={layoutItems.custom}
            onChange={onLayoutItemChange}
            accentColor={form.accentColor}
            labelRef={labelBodyRef}
            selected={selectedItem === "custom" || activeInspectorTarget === "custom"}
            onSelect={selectItem}
            onContextMenu={buildHideBlockMenu("custom")}
          >
            <div
              className={`grid free-grid ${visibleCustomFields.length <= 1 ? "single-stat" : ""} ${visibleCustomFields.length === 2 ? "two-stats" : ""}`}
              onContextMenu={event => openContextMenu(event, buildMenuTree())}
            >
              {visibleCustomFields.map(field => (
                <div
                  key={field.id}
                  onContextMenu={event => openContextMenu(event, [
                    { label: t("removeCell"), action: () => onRemoveCustomField?.(field.id) },
                    { type: "divider" },
                    ...buildMenuTree()
                  ])}
                  onContextMenuCapture={event => event.stopPropagation()}
                >
                  <small>{field.label || t("customFieldLabel")}</small>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          </EditableBlock>
        )}

        {form.showBarcode && layoutItems.barcode.visible !== false && (
        <EditableBlock
          itemKey="barcode"
            frame={layoutItems.barcode}
            onChange={onLayoutItemChange}
          accentColor={form.accentColor}
          labelRef={labelBodyRef}
          selected={selectedItem === "barcode" || activeInspectorTarget === "barcode"}
          onSelect={selectItem}
          onContextMenu={buildHideBlockMenu("barcode")}
        >
            <svg ref={barcodeRef} id="barcode" />
          </EditableBlock>
        )}

        {(form.showQr || form.showNote) && layoutItems.footer.visible !== false && (
          <EditableBlock
            itemKey="footer"
            frame={layoutItems.footer}
            onChange={onLayoutItemChange}
            accentColor={form.accentColor}
            labelRef={labelBodyRef}
            selected={selectedItem === "footer" || activeInspectorTarget === "footer"}
            onSelect={selectItem}
            onContextMenu={buildHideBlockMenu("footer")}
          >
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
      {contextMenu && typeof document !== "undefined" && createPortal(
        <div
          className="preview-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={event => event.stopPropagation()}
        >
          <ContextMenuList items={contextMenu.items} onClose={() => setContextMenu(null)} />
        </div>,
        document.body
      )}
    </section>
  );
}
