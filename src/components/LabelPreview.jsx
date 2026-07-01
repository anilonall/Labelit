import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { defaultLayoutItems, normalizeLayoutItems } from "../constants/layoutItems";
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

function snapToGuide(value, guides, threshold = 2.2) {
  let snappedValue = value;
  let snappedGuide = null;
  let minDistance = threshold;

  guides.forEach(guide => {
    const distance = Math.abs(value - guide);
    if (distance <= minDistance) {
      minDistance = distance;
      snappedValue = guide;
      snappedGuide = guide;
    }
  });

  return { value: snappedValue, guide: snappedGuide };
}

function findBestGuide(points, guides, threshold = 2.2) {
  let bestMatch = null;

  points.forEach(point => {
    guides.forEach(guide => {
      const distance = Math.abs(point.position - guide);
      if (distance > threshold) {
        return;
      }

      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          ...point,
          guide,
          distance
        };
      }
    });
  });

  return bestMatch;
}

function getBlockLabel(itemKey) {
  const labels = {
    brand: "Logo / Marka",
    title: "Baslik",
    sender: "Gonderen",
    recipient: "Alici",
    primary: "Ana Bilgiler",
    secondary: "Ikinci Bilgiler",
    custom: "Ozel Alanlar",
    barcode: "Barkod",
    footer: "Alt Alan"
  };

  return labels[itemKey] || itemKey;
}

function getLayoutPresetPatch(preset) {
  if (preset === "fullWidth") {
    return { x: 4, w: 92 };
  }

  if (preset === "leftCard") {
    return { x: 4, w: 44 };
  }

  if (preset === "rightCard") {
    return { x: 52, w: 44 };
  }

  if (preset === "footerStrip") {
    return { x: 4, y: 88, w: 92, h: 8 };
  }

  return null;
}

function buildSnapGuides(layoutItems, activeItemKey, gridXStep = 0, gridYStep = 0, includeGrid = false) {
  const vertical = [0, 50, 100];
  const horizontal = [0, 50, 100];

  Object.entries(layoutItems).forEach(([key, frame]) => {
    if (key === activeItemKey || frame.visible === false) {
      return;
    }

    vertical.push(frame.x, frame.x + (frame.w / 2), frame.x + frame.w);
    horizontal.push(frame.y, frame.y + (frame.h / 2), frame.y + frame.h);
  });

  if (includeGrid && gridXStep > 0 && gridYStep > 0) {
    for (let x = gridXStep; x < 100; x += gridXStep) {
      vertical.push(x);
    }

    for (let y = gridYStep; y < 100; y += gridYStep) {
      horizontal.push(y);
    }
  }

  return {
    vertical: [...new Set(vertical.map(value => Number(value.toFixed(2))))],
    horizontal: [...new Set(horizontal.map(value => Number(value.toFixed(2))))]
  };
}

function InlineEditableText({
  value,
  placeholder = "",
  multiline = false,
  className = "",
  onCommit
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    if (!editing) {
      setDraft(value || "");
    }
  }, [value, editing]);

  if (editing) {
    const sharedProps = {
      value: draft,
      autoFocus: true,
      className: `inline-edit-input ${className}`.trim(),
      onChange: event => setDraft(event.target.value),
      onBlur: () => {
        setEditing(false);
        onCommit?.(draft);
      },
      onPointerDown: event => event.stopPropagation(),
      onClick: event => event.stopPropagation(),
      onKeyDown: event => {
        if (event.key === "Escape") {
          event.preventDefault();
          setDraft(value || "");
          setEditing(false);
        }

        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          setEditing(false);
          onCommit?.(draft);
        }

        if (multiline && event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          setEditing(false);
          onCommit?.(draft);
        }
      }
    };

    return multiline ? <textarea {...sharedProps} rows={3} /> : <input {...sharedProps} />;
  }

  return (
    <span
      className={`inline-edit-display ${className}`.trim()}
      onDoubleClick={event => {
        event.stopPropagation();
        setEditing(true);
      }}
      title="Cift tikla duzenle"
    >
      {value || placeholder}
    </span>
  );
}

function EditableBlock({ itemKey, frame, onChange, children, accentColor, labelRef, selected, onSelect, onContextMenu, onGuideChange, snapGuides, title }) {
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
      const rawX = clamp(editState.origin.x + deltaXPercent, 0, 100 - editState.origin.w);
      const rawY = clamp(editState.origin.y + deltaYPercent, 0, 100 - editState.origin.h);
      const bestX = findBestGuide([
        { anchor: "start", position: rawX },
        { anchor: "center", position: rawX + (editState.origin.w / 2) },
        { anchor: "end", position: rawX + editState.origin.w }
      ], snapGuides.vertical);
      const bestY = findBestGuide([
        { anchor: "start", position: rawY },
        { anchor: "center", position: rawY + (editState.origin.h / 2) },
        { anchor: "end", position: rawY + editState.origin.h }
      ], snapGuides.horizontal);
      const nextX = bestX
        ? clamp(
          bestX.anchor === "center"
            ? bestX.guide - (editState.origin.w / 2)
            : bestX.anchor === "end"
              ? bestX.guide - editState.origin.w
              : bestX.guide,
          0,
          100 - editState.origin.w
        )
        : rawX;
      const nextY = bestY
        ? clamp(
          bestY.anchor === "center"
            ? bestY.guide - (editState.origin.h / 2)
            : bestY.anchor === "end"
              ? bestY.guide - editState.origin.h
              : bestY.guide,
          0,
          100 - editState.origin.h
        )
        : rawY;

      onGuideChange?.({
        vertical: bestX?.guide ?? null,
        horizontal: bestY?.guide ?? null
      });
      onChange(itemKey, { x: nextX, y: nextY });
      return;
    }

    const rawW = clamp(editState.origin.w + deltaXPercent, 12, 100 - editState.origin.x);
    const rawH = clamp(editState.origin.h + deltaYPercent, 8, 100 - editState.origin.y);
    const nextRight = snapToGuide(rawW + editState.origin.x, snapGuides.vertical);
    const nextBottom = snapToGuide(rawH + editState.origin.y, snapGuides.horizontal);
    const snappedW = nextRight.value - editState.origin.x;
    const snappedH = nextBottom.value - editState.origin.y;
    const w = clamp(snappedW, 12, 100 - editState.origin.x);
    const h = clamp(snappedH, 8, 100 - editState.origin.y);
    onGuideChange?.({
      vertical: nextRight.guide,
      horizontal: nextBottom.guide
    });
    onChange(itemKey, { w, h });
  };

  const stopEdit = event => {
    if (!editState || (event.pointerId !== undefined && editState.pointerId !== event.pointerId)) {
      return;
    }

    setEditState(null);
    onGuideChange?.({ vertical: null, horizontal: null });
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
      {selected && (
        <div className="layout-block-chip">
          <strong>{title}</strong>
          <span>{Math.round(frame.x)} / {Math.round(frame.y)} · {Math.round(frame.w)} x {Math.round(frame.h)}</span>
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
  onUpdateCustomField,
  onDuplicateCustomField,
  onLayoutItemDrop,
  activeInspectorTarget,
  onInspectTargetChange
}) {
  const { weightText, distanceText, deliveryTimeText, deliveryTypeText, visiblePrimaryCount, visibleSecondaryCount } = stats;
  const horizontalTicks = buildTicks(Number(form.labelWidthMm) || 100);
  const verticalTicks = buildTicks(Number(form.labelHeightMm) || 150);
  const gridStep = Math.max(2, Number(form.gridStepMm) || 10);
  const gridColumns = Math.max(1, Number(form.labelWidthMm) / gridStep);
  const gridRows = Math.max(1, Number(form.labelHeightMm) / gridStep);
  const gridXStep = 100 / gridColumns;
  const gridYStep = 100 / gridRows;
  const fontOption = getFontOption(form.fontFamily);
  const visibleCustomFields = (stats.customFields || []).filter(field => field.visible !== false && (field.label || field.value));
  const layoutItems = normalizeLayoutItems(form.layoutItems);
  const snapGuidesByItem = useMemo(() => Object.fromEntries(
    Object.keys(layoutItems).map(key => [key, buildSnapGuides(layoutItems, key, gridXStep, gridYStep, form.showGridOverlay)])
  ), [form.showGridOverlay, gridXStep, gridYStep, layoutItems]);
  const menuLabels = buildMenuLabels(form.uiLanguage);
  const labelBodyRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [snapGuides, setSnapGuides] = useState({ vertical: null, horizontal: null });
  const [copiedBlockFrame, setCopiedBlockFrame] = useState(null);
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

  const buildBlockActionMenu = blockKey => {
    const currentFrame = layoutItems[blockKey];
    const defaultFrame = defaultLayoutItems[blockKey];
    const copiedFrame = copiedBlockFrame?.frame || null;
    const canPasteFrame = Boolean(copiedFrame);

    const pasteFrame = patch => {
      if (!copiedFrame) {
        return;
      }

      const nextW = patch?.w ?? copiedFrame.w;
      const nextH = patch?.h ?? copiedFrame.h;
      const nextX = clamp(patch?.x ?? copiedFrame.x, 0, 100 - nextW);
      const nextY = clamp(patch?.y ?? copiedFrame.y, 0, 100 - nextH);

      onLayoutItemChange?.(blockKey, {
        x: nextX,
        y: nextY,
        w: nextW,
        h: nextH,
        visible: true
      });
    };

    return [
      {
        label: "Duzen Kopyala / Yapistir",
        children: [
          {
            label: "Duzeni kopyala",
            action: () => setCopiedBlockFrame({
              sourceKey: blockKey,
              frame: {
                x: currentFrame.x,
                y: currentFrame.y,
                w: currentFrame.w,
                h: currentFrame.h
              }
            }),
            stateLabel: menuLabels.submenu
          },
          {
            label: "Tam duzeni yapistir",
            action: () => pasteFrame(),
            stateLabel: canPasteFrame ? (copiedBlockFrame?.sourceKey === blockKey ? "Ayni alan" : "Hazir") : "Bos"
          },
          {
            label: "Sadece genislik yapistir",
            action: () => pasteFrame({ w: copiedFrame?.w ?? currentFrame.w, x: currentFrame.x, y: currentFrame.y, h: currentFrame.h }),
            stateLabel: canPasteFrame ? "Hazir" : "Bos"
          },
          {
            label: "Sadece yukseklik yapistir",
            action: () => pasteFrame({ h: copiedFrame?.h ?? currentFrame.h, x: currentFrame.x, y: currentFrame.y, w: currentFrame.w }),
            stateLabel: canPasteFrame ? "Hazir" : "Bos"
          }
        ]
      },
      {
        label: "Hizli Islemler",
        children: [
          {
            label: "Ortala",
            action: () => onLayoutItemChange?.(blockKey, {
              x: clamp((100 - currentFrame.w) / 2, 0, 100 - currentFrame.w),
              y: clamp((100 - currentFrame.h) / 2, 0, 100 - currentFrame.h)
            }),
            stateLabel: menuLabels.submenu
          },
          {
            label: "Varsayilana don",
            action: () => defaultFrame ? onLayoutItemChange?.(blockKey, { ...defaultFrame }) : null,
            stateLabel: menuLabels.submenu
          },
          {
            label: "Gizle",
            action: () => onLayoutItemChange?.(blockKey, { visible: false }),
            stateLabel: menuLabels.submenu
          }
        ]
      },
      {
        label: "Hazir Yerlesim",
        children: [
          {
            label: "Tam Genis",
            action: () => onLayoutItemChange?.(blockKey, getLayoutPresetPatch("fullWidth")),
            stateLabel: menuLabels.submenu
          },
          {
            label: "Sol Kart",
            action: () => onLayoutItemChange?.(blockKey, getLayoutPresetPatch("leftCard")),
            stateLabel: menuLabels.submenu
          },
          {
            label: "Sag Kart",
            action: () => onLayoutItemChange?.(blockKey, getLayoutPresetPatch("rightCard")),
            stateLabel: menuLabels.submenu
          },
          {
            label: "Alt Serit",
            action: () => onLayoutItemChange?.(blockKey, getLayoutPresetPatch("footerStrip")),
            stateLabel: menuLabels.submenu
          }
        ]
      },
      { type: "divider" }
    ];
  };

  const openAddMenu = event => {
    openContextMenu(event, buildMenuTree());
  };

  const removeBuiltInCell = key => onFieldChange?.(key, false);
  const buildRemoveMenu = key => event => openContextMenu(event, [{ label: t("removeCell"), action: () => removeBuiltInCell(key) }]);
  const buildHideBlockMenu = blockKey => event => openContextMenu(event, [
    ...buildBlockActionMenu(blockKey),
    ...buildMenuTree({
      removeAction: () => onLayoutItemChange?.(blockKey, { visible: false })
    })
  ]);

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
        onDragOver={event => {
          const itemKey = event.dataTransfer?.types?.includes("application/x-labelit-layout-item");
          if (!itemKey) {
            return;
          }
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setIsDropActive(true);
        }}
        onDragEnter={event => {
          const itemKey = event.dataTransfer?.types?.includes("application/x-labelit-layout-item");
          if (!itemKey) {
            return;
          }
          event.preventDefault();
          setIsDropActive(true);
        }}
        onDragLeave={event => {
          if (!labelBodyRef.current?.contains(event.relatedTarget)) {
            setIsDropActive(false);
          }
        }}
        onDrop={event => {
          const itemKey = event.dataTransfer?.getData("application/x-labelit-layout-item") || event.dataTransfer?.getData("text/plain");
          if (!itemKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          const bounds = labelBodyRef.current?.getBoundingClientRect();
          if (!bounds) {
            return;
          }
          const x = ((event.clientX - bounds.left) / bounds.width) * 100;
          const y = ((event.clientY - bounds.top) / bounds.height) * 100;
          onLayoutItemDrop?.(itemKey, { x, y });
          selectItem(itemKey);
          setIsDropActive(false);
        }}
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
        {snapGuides.vertical !== null && (
          <div className="label-snap-guide vertical" style={{ left: `${snapGuides.vertical}%` }} />
        )}
        {snapGuides.horizontal !== null && (
          <div className="label-snap-guide horizontal" style={{ top: `${snapGuides.horizontal}%` }} />
        )}
        {isDropActive && (
          <div className="label-drop-indicator">
            <strong>Buraya birak</strong>
            <span>Secilen alan etikete eklenecek ve otomatik aktif olacak.</span>
          </div>
        )}
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
          onGuideChange={setSnapGuides}
          snapGuides={snapGuidesByItem.brand}
          title={getBlockLabel("brand")}
        >
          <div className="logo-wrap">
            {form.logoDataUrl ? <img className="logo-image" alt="Logo" src={form.logoDataUrl} /> : (
              <div className="logo" style={{ color: form.accentColor }}>
                <InlineEditableText
                  value={form.brandName}
                  placeholder={t("logoBrand")}
                  onCommit={nextValue => onFieldChange?.("brandName", nextValue)}
                />
              </div>
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
          onGuideChange={setSnapGuides}
          snapGuides={snapGuidesByItem.title}
          title={getBlockLabel("title")}
        >
          <div className="cargo" style={{ color: form.accentColor }}>
            <InlineEditableText
              value={form.labelTitle}
              placeholder={t("title")}
              onCommit={nextValue => onFieldChange?.("labelTitle", nextValue)}
            />
          </div>
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
            onGuideChange={setSnapGuides}
            snapGuides={snapGuidesByItem.sender}
            title={getBlockLabel("sender")}
          >
            <div className="block free-block">
              <small>{t("labelSender")}</small>
              <strong>
                <InlineEditableText
                  value={form.senderName}
                  placeholder={t("labelSender")}
                  onCommit={nextValue => onFieldChange?.("senderName", nextValue)}
                />
              </strong>
              {form.showSenderAddress && (
                <p>
                  <InlineEditableText
                    value={form.senderAddress}
                    placeholder={t("senderAddress")}
                    multiline
                    onCommit={nextValue => onFieldChange?.("senderAddress", nextValue)}
                  />
                </p>
              )}
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
            onGuideChange={setSnapGuides}
            snapGuides={snapGuidesByItem.recipient}
            title={getBlockLabel("recipient")}
          >
            <div className={`block recipient free-block ${form.highlightRecipient ? "highlighted" : ""}`} style={{ borderColor: form.highlightRecipient ? form.accentColor : "transparent" }}>
              <small>{t("labelRecipient")}</small>
              <strong>
                <InlineEditableText
                  value={form.recipientName}
                  placeholder={t("labelRecipient")}
                  onCommit={nextValue => onFieldChange?.("recipientName", nextValue)}
                />
              </strong>
              {form.showRecipientAddress && (
                <p>
                  <InlineEditableText
                    value={form.recipientAddress}
                    placeholder={t("recipientAddress")}
                    multiline
                    onCommit={nextValue => onFieldChange?.("recipientAddress", nextValue)}
                  />
                </p>
              )}
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
          onGuideChange={setSnapGuides}
          snapGuides={snapGuidesByItem.primary}
          title={getBlockLabel("primary")}
        >
          <div className={`grid free-grid ${visiblePrimaryCount <= 1 ? "single-stat" : ""} ${visiblePrimaryCount === 2 ? "two-stats" : ""}`}>
            {form.showOrderNo && (
              <div onContextMenu={buildRemoveMenu("showOrderNo")} onContextMenuCapture={event => event.stopPropagation()}>
                <small>{t("labelOrderNo")}</small>
                <strong>
                  <InlineEditableText
                    value={form.orderNo}
                    placeholder={t("orderNo")}
                    onCommit={nextValue => onFieldChange?.("orderNo", nextValue)}
                  />
                </strong>
              </div>
            )}
            {form.showReference && (
              <div onContextMenu={buildRemoveMenu("showReference")} onContextMenuCapture={event => event.stopPropagation()}>
                <small>{t("labelReference")}</small>
                <strong>
                  <InlineEditableText
                    value={form.reference}
                    placeholder={t("reference")}
                    onCommit={nextValue => onFieldChange?.("reference", nextValue)}
                  />
                </strong>
              </div>
            )}
            {form.showWeight && (
              <div onContextMenu={buildRemoveMenu("showWeight")} onContextMenuCapture={event => event.stopPropagation()}>
                <small>{t("labelWeight")}</small>
                <strong>
                  <InlineEditableText
                    value={form.weightValue}
                    placeholder={t("weight")}
                    onCommit={nextValue => onFieldChange?.("weightValue", nextValue)}
                  />
                  {form.weightUnit ? ` ${form.weightUnit}` : ""}
                </strong>
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
            onGuideChange={setSnapGuides}
            snapGuides={snapGuidesByItem.secondary}
            title={getBlockLabel("secondary")}
          >
            <div className={`grid free-grid ${visibleSecondaryCount <= 1 ? "single-stat" : ""} ${visibleSecondaryCount === 2 ? "two-stats" : ""}`}>
              {form.showDistance && (
                <div onContextMenu={buildRemoveMenu("showDistance")} onContextMenuCapture={event => event.stopPropagation()}>
                  <small>{t("labelDistance")}</small>
                  <strong>
                    <InlineEditableText
                      value={form.distanceValue}
                      placeholder={t("distance")}
                      onCommit={nextValue => onFieldChange?.("distanceValue", nextValue)}
                    />
                    {form.distanceUnit ? ` ${form.distanceUnit}` : ""}
                  </strong>
                </div>
              )}
              {form.showDeliveryTime && (
                <div onContextMenu={buildRemoveMenu("showDeliveryTime")} onContextMenuCapture={event => event.stopPropagation()}>
                  <small>{t("labelDelivery")}</small>
                  <strong>
                    <InlineEditableText
                      value={form.deliveryTime}
                      placeholder={deliveryTimeText || t("deliveryTime")}
                      onCommit={nextValue => onFieldChange?.("deliveryTime", nextValue)}
                    />
                  </strong>
                </div>
              )}
              {form.showDeliveryType && (
                <div onContextMenu={buildRemoveMenu("showDeliveryType")} onContextMenuCapture={event => event.stopPropagation()}>
                  <small>{t("labelType")}</small>
                  <strong>
                    <InlineEditableText
                      value={form.deliveryType}
                      placeholder={t("deliveryType")}
                      onCommit={nextValue => onFieldChange?.("deliveryType", nextValue)}
                    />
                  </strong>
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
            onGuideChange={setSnapGuides}
            snapGuides={snapGuidesByItem.custom}
            title={getBlockLabel("custom")}
          >
            <div
              className={`grid free-grid ${visibleCustomFields.length <= 1 ? "single-stat" : ""} ${visibleCustomFields.length === 2 ? "two-stats" : ""}`}
              onContextMenu={event => openContextMenu(event, buildMenuTree())}
            >
              {visibleCustomFields.map(field => (
                <div
                  key={field.id}
                  onContextMenu={event => openContextMenu(event, [
                    { label: "Alani kopyala", action: () => onDuplicateCustomField?.(field.id) },
                    { type: "divider" },
                    { label: t("removeCell"), action: () => onRemoveCustomField?.(field.id) },
                    { type: "divider" },
                    ...buildMenuTree()
                  ])}
                  onContextMenuCapture={event => event.stopPropagation()}
                >
                  <small>
                    <InlineEditableText
                      value={field.label}
                      placeholder={t("customFieldLabel")}
                      onCommit={nextValue => onUpdateCustomField?.(field.id, { label: nextValue })}
                    />
                  </small>
                  <strong>
                    <InlineEditableText
                      value={field.value}
                      placeholder={t("customFieldValue")}
                      onCommit={nextValue => onUpdateCustomField?.(field.id, { value: nextValue })}
                    />
                  </strong>
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
          onGuideChange={setSnapGuides}
          snapGuides={snapGuidesByItem.barcode}
          title={getBlockLabel("barcode")}
        >
            <div className="barcode-edit-wrap">
              <svg ref={barcodeRef} id="barcode" />
              {form.showBarcodeValue && (
                <div className="barcode-inline-value">
                  <InlineEditableText
                    value={form.barcodeText}
                    placeholder={t("barcode")}
                    onCommit={nextValue => onFieldChange?.("barcodeText", nextValue)}
                  />
                </div>
              )}
            </div>
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
            onGuideChange={setSnapGuides}
            snapGuides={snapGuidesByItem.footer}
            title={getBlockLabel("footer")}
          >
            <div className={`bottom free-bottom ${!form.showQr ? "no-qr" : ""}`}>
              {form.showQr && <div id="qrcode">{qrDataUrl ? <img src={qrDataUrl} alt="QR Code" width={form.density === "compact" ? 72 : 85} height={form.density === "compact" ? 72 : 85} /> : null}</div>}
              {form.showNote && (
                <div>
                  <small>{t("labelNote")}</small>
                  <p>
                    <InlineEditableText
                      value={form.note}
                      placeholder={t("note")}
                      multiline
                      onCommit={nextValue => onFieldChange?.("note", nextValue)}
                    />
                  </p>
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
