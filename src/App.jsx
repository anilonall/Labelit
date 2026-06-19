import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const LIBRARY_KEY = "label-template-library-v1";
const builtInTemplateKeys = ["shipping", "cargo", "receiving", "return", "transfer", "pallet"];

const presetSizes = {
  "4x6": { width: 101.6, height: 152.4 },
  "100x150": { width: 100, height: 150 },
  a6: { width: 105, height: 148 },
  custom: null
};

const baseTemplates = {
  shipping: {
    name: "Sevkiyat Etiketi",
    description: "Sevk ve dagitim surecleri icin genel cikis etiketi.",
    brandName: "S4IN",
    labelTitle: "SEVKIYAT ETIKETI",
    accentColor: "#f97316",
    backgroundColor: "#ffffff",
    textColor: "#111111",
    borderColor: "#111111",
    borderWidth: 2,
    density: "comfortable",
    showQr: true,
    showNote: true,
    highlightRecipient: true,
    showOrderNo: true,
    showReference: true,
    showWeight: true,
    showDistance: true,
    showDeliveryTime: true,
    printMode: "thermal",
    sheetLayout: "single",
    sizePreset: "4x6",
    labelWidthMm: 101.6,
    labelHeightMm: 152.4,
    pageMarginTop: 12,
    pageMarginSide: 12,
    sheetGap: 8,
    logoDataUrl: ""
  },
  cargo: {
    name: "Kargo Etiketi",
    description: "Teslimat ve kurye akislarina uygun standart kargo duzeni.",
    brandName: "CARGO",
    labelTitle: "KARGO ETIKETI",
    accentColor: "#0f766e",
    backgroundColor: "#f8fafc",
    textColor: "#0f172a",
    borderColor: "#0f766e",
    borderWidth: 3,
    density: "compact",
    showQr: true,
    showNote: false,
    highlightRecipient: true,
    showOrderNo: true,
    showReference: true,
    showWeight: true,
    showDistance: true,
    showDeliveryTime: true,
    printMode: "a4",
    sheetLayout: "2x2",
    sizePreset: "100x150",
    labelWidthMm: 100,
    labelHeightMm: 150,
    pageMarginTop: 12,
    pageMarginSide: 12,
    sheetGap: 6,
    logoDataUrl: ""
  },
  receiving: {
    name: "Mal Kabul Etiketi",
    description: "Gelen urun kontrol ve kabul operasyonlari icin net alanlar.",
    brandName: "RECEIVING",
    labelTitle: "MAL KABUL ETIKETI",
    accentColor: "#7c3aed",
    backgroundColor: "#fcfbff",
    textColor: "#2e1065",
    borderColor: "#8b5cf6",
    borderWidth: 2,
    density: "comfortable",
    showQr: true,
    showNote: true,
    highlightRecipient: false,
    showOrderNo: true,
    showReference: true,
    showWeight: true,
    showDistance: true,
    showDeliveryTime: true,
    printMode: "thermal",
    sheetLayout: "single",
    sizePreset: "a6",
    labelWidthMm: 105,
    labelHeightMm: 148,
    pageMarginTop: 10,
    pageMarginSide: 10,
    sheetGap: 6,
    logoDataUrl: ""
  },
  return: {
    name: "Iade Etiketi",
    description: "Iade urunlerin ayrisma ve geri kabul surecleri icin.",
    brandName: "RETURN",
    labelTitle: "IADE ETIKETI",
    accentColor: "#dc2626",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#111827",
    borderWidth: 4,
    density: "compact",
    showQr: true,
    showNote: true,
    highlightRecipient: true,
    showOrderNo: true,
    showReference: true,
    showWeight: true,
    showDistance: true,
    showDeliveryTime: true,
    printMode: "a4",
    sheetLayout: "3x2",
    sizePreset: "4x6",
    labelWidthMm: 101.6,
    labelHeightMm: 152.4,
    pageMarginTop: 8,
    pageMarginSide: 8,
    sheetGap: 4,
    logoDataUrl: ""
  },
  transfer: {
    name: "Depo Transfer Etiketi",
    description: "Depolar arasi urun hareketleri ve lokasyon transferleri icin.",
    brandName: "TRANSFER",
    labelTitle: "DEPO TRANSFER ETIKETI",
    accentColor: "#1d4ed8",
    backgroundColor: "#f8fbff",
    textColor: "#0f172a",
    borderColor: "#1d4ed8",
    borderWidth: 3,
    density: "compact",
    showQr: true,
    showNote: true,
    highlightRecipient: true,
    showOrderNo: true,
    showReference: true,
    showWeight: true,
    showDistance: true,
    showDeliveryTime: true,
    printMode: "a4",
    sheetLayout: "2x2",
    sizePreset: "4x6",
    labelWidthMm: 101.6,
    labelHeightMm: 152.4,
    pageMarginTop: 10,
    pageMarginSide: 10,
    sheetGap: 6,
    logoDataUrl: ""
  },
  pallet: {
    name: "Palet Etiketi",
    description: "Palet takibi, saha sevki ve buyuk hacimli yuklemeler icin.",
    brandName: "PALLET",
    labelTitle: "PALET ETIKETI",
    accentColor: "#0f766e",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#0f172a",
    borderWidth: 4,
    density: "compact",
    showQr: true,
    showNote: true,
    highlightRecipient: true,
    showOrderNo: true,
    showReference: true,
    showWeight: true,
    showDistance: true,
    showDeliveryTime: true,
    printMode: "a4",
    sheetLayout: "2x2",
    sizePreset: "100x150",
    labelWidthMm: 100,
    labelHeightMm: 150,
    pageMarginTop: 10,
    pageMarginSide: 10,
    sheetGap: 6,
    logoDataUrl: ""
  }
};

const blankTemplate = {
  name: "Bos Etiket",
  description: "Sifirdan baslamak icin temiz alan.",
  brandName: "",
  labelTitle: "SHIPPING LABEL",
  accentColor: "#f97316",
  backgroundColor: "#ffffff",
  textColor: "#111111",
  borderColor: "#111111",
  borderWidth: 2,
  density: "comfortable",
  showQr: true,
  showNote: true,
  highlightRecipient: false,
  showOrderNo: true,
  showReference: true,
  showWeight: true,
  showDistance: true,
  showDeliveryTime: true,
  printMode: "thermal",
  sheetLayout: "single",
  sizePreset: "4x6",
  labelWidthMm: 101.6,
  labelHeightMm: 152.4,
  pageMarginTop: 12,
  pageMarginSide: 12,
  sheetGap: 8,
  logoDataUrl: ""
};

const defaultContent = {
  senderName: "S4IN Teknoloji A.S.",
  senderAddress: "Mansuroglu Mah. 286/1 Sok.\nBayrakli / Izmir\nTurkiye 35535",
  recipientName: "Anil Onal",
  recipientAddress: "Ataturk Mah. 1205 Sok. No:15\nBornova / Izmir\n35040 Turkiye",
  orderNo: "S4IN-20260618-000128",
  reference: "INV-20260618-1452",
  weightValue: "2.35",
  weightUnit: "KG",
  distanceValue: "24.5",
  distanceUnit: "KM",
  deliveryTime: "2026-06-18T14:30",
  deliveryType: "Ayni Gun",
  deliveryWindow: "2 Saat Icinde",
  barcodeText: "869123456789012345678901",
  note: "Kargo guvenlige teslim edilebilir."
};

function loadTemplates() {
  if (typeof window === "undefined") {
    return { ...baseTemplates };
  }

  const merged = { ...baseTemplates };
  const raw = window.localStorage.getItem(LIBRARY_KEY);

  if (!raw) {
    return merged;
  }

  try {
    const parsed = JSON.parse(raw);
    return { ...merged, ...parsed };
  } catch {
    window.localStorage.removeItem(LIBRARY_KEY);
    return merged;
  }
}

function formatMeasurement(value, unit) {
  const normalized = String(value || "").trim();
  return normalized ? `${normalized} ${unit}`.trim() : "";
}

function formatDeliveryTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map(char => char + char).join("") : value;
  const bigint = parseInt(normalized, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgbaHex(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  const mix = channel => Math.round((255 * (1 - alpha)) + (channel * alpha));
  return `#${[mix(r), mix(g), mix(b)].map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safe(value) {
  return String(value || "")
    .replace(/[\u011f\u011e]/g, "g")
    .replace(/[\u00fc\u00dc]/g, "u")
    .replace(/[\u015f\u015e]/g, "s")
    .replace(/[\u0131\u0130]/g, "i")
    .replace(/[\u00f6\u00d6]/g, "o")
    .replace(/[\u00e7\u00c7]/g, "c");
}

function slugify(value) {
  return safe(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "benim-sablonum";
}

function mmToInch(value) {
  return value / 25.4;
}

function wrapText(pdf, text, maxWidth) {
  return pdf.splitTextToSize(String(text || ""), maxWidth);
}

function getPrimaryStats(state) {
  const stats = [];
  if (state.showOrderNo) stats.push(["SIPARIS NO", state.orderNo]);
  if (state.showReference) stats.push(["REFERANS", state.reference]);
  if (state.showWeight) stats.push(["AGIRLIK", state.weight]);
  return stats;
}

function getSecondaryStats(state) {
  const stats = [];
  if (state.showDistance) stats.push(["MESAFE", state.distance]);
  if (state.showDeliveryTime) stats.push(["TESLIMAT", state.deliveryTime]);
  if (state.showDeliveryTime) stats.push(["TIP", state.deliveryType]);
  return stats;
}

function buildInitialForm() {
  return {
    templateName: baseTemplates.shipping.name,
    ...baseTemplates.shipping,
    ...defaultContent
  };
}

function StartupCard({ title, description, templateKey, children, onClick }) {
  return (
    <button type="button" className="startup-card" data-start-template={templateKey} onClick={onClick}>
      <div className={`startup-thumb ${templateKey ? `thumb-${templateKey}` : "blank-thumb"}`}>{children}</div>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function App() {
  const [templates, setTemplates] = useState(loadTemplates);
  const [activeTemplate, setActiveTemplate] = useState("shipping");
  const [form, setForm] = useState(buildInitialForm);
  const [showStartupOverlay, setShowStartupOverlay] = useState(true);
  const [scannerInput, setScannerInput] = useState("");
  const [zplOutput, setZplOutput] = useState("");
  const [scale, setScale] = useState(1);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState(null);
  const [previewTransform, setPreviewTransform] = useState("translate(-50%, -50%) scale(1)");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const scannerTimerRef = useRef(null);
  const scannerValueRef = useRef("");
  const barcodeRef = useRef(null);
  const labelRef = useRef(null);
  const activeSlotRef = useRef(null);
  const logoInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const scannerInputRef = useRef(null);

  const isBuiltInTemplate = key => builtInTemplateKeys.includes(key);
  const logoStatus = form.logoDataUrl ? "Logo gorseli yuklendi." : "Su an yazi logosu kullaniliyor.";
  const weightText = formatMeasurement(form.weightValue, form.weightUnit);
  const distanceText = formatMeasurement(form.distanceValue, form.distanceUnit);
  const deliveryTimeText = formatDeliveryTime(form.deliveryTime);
  const deliveryTypeText = [form.deliveryType, form.deliveryWindow].filter(Boolean).join(" / ");
  const visiblePrimaryCount = [form.showOrderNo, form.showReference, form.showWeight].filter(Boolean).length;
  const visibleSecondaryCount = [form.showDistance, form.showDeliveryTime, form.showDeliveryTime].filter(Boolean).length;
  const previewModeTitle = form.printMode === "thermal" ? "Termal Etiket" : "A4 Sayfa Onizlemesi";
  const previewModeCopy = form.printMode === "thermal"
    ? `${Number(form.labelWidthMm).toFixed(1)} x ${Number(form.labelHeightMm).toFixed(1)} mm termal cikti gorunumu.`
    : `A4 sayfada ${form.sheetLayout} yerlesimi, ${form.pageMarginTop} mm ust ve ${form.pageMarginSide} mm yan bosluk.`;
  const layout = form.printMode === "thermal" ? "single" : form.sheetLayout;
  const slotCount = layout === "single" ? 1 : layout === "2x2" ? 4 : 6;
  const printableState = {
    ...form,
    weight: weightText,
    distance: distanceText,
    deliveryTime: deliveryTimeText,
    deliveryType: deliveryTypeText,
    barcodeText: form.barcodeText || "0000000000"
  };

  useEffect(() => {
    const customTemplates = Object.fromEntries(
      Object.entries(templates).filter(([key]) => !isBuiltInTemplate(key))
    );
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(customTemplates));
  }, [templates]);

  useEffect(() => {
    if (!barcodeRef.current) {
      return;
    }

    JsBarcode(barcodeRef.current, form.barcodeText || "0000000000", {
      format: "CODE128",
      displayValue: true,
      fontSize: form.density === "compact" ? 11 : 14,
      lineColor: form.textColor,
      height: form.density === "compact" ? 62 : 72,
      margin: 0
    });
  }, [form.barcodeText, form.density, form.textColor]);

  useEffect(() => {
    let cancelled = false;
    if (!form.showQr) {
      setQrDataUrl("");
      return;
    }

    QRCode.toDataURL(form.barcodeText || "0000000000", {
      width: form.density === "compact" ? 72 : 85,
      margin: 0
    }).then(url => {
      if (!cancelled) {
        setQrDataUrl(url);
      }
    }).catch(() => {
      if (!cancelled) {
        setQrDataUrl("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [form.barcodeText, form.density, form.showQr]);

  useEffect(() => {
    const onResize = () => {
      setPreviewOffset(current => ({ x: current.x, y: current.y }));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => () => window.clearTimeout(scannerTimerRef.current), []);

  useLayoutEffect(() => {
    const activeSlot = activeSlotRef.current;
    const label = labelRef.current;

    if (!activeSlot || !label) {
      return;
    }

    label.style.transform = "translate(-50%, -50%) scale(1)";
    const availableWidth = activeSlot.clientWidth - 12;
    const availableHeight = activeSlot.clientHeight - 12;
    const labelWidth = label.offsetWidth;
    const labelHeight = label.offsetHeight;

    if (!availableWidth || !availableHeight || !labelWidth || !labelHeight) {
      setPreviewTransform(`translate(-50%, -50%) scale(${scale})`);
      return;
    }

    const fitScale = Math.min(availableWidth / labelWidth, availableHeight / labelHeight, 1);
    const finalScale = Math.min(fitScale, fitScale * scale);
    const scaledWidth = labelWidth * finalScale;
    const scaledHeight = labelHeight * finalScale;
    const maxOffsetX = Math.max(0, (scaledWidth - availableWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - availableHeight) / 2);
    const clampedX = clamp(previewOffset.x, -maxOffsetX, maxOffsetX);
    const clampedY = clamp(previewOffset.y, -maxOffsetY, maxOffsetY);

    if (clampedX !== previewOffset.x || clampedY !== previewOffset.y) {
      setPreviewOffset({ x: clampedX, y: clampedY });
      return;
    }

    setPreviewTransform(
      `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px) scale(${finalScale})`
    );
  }, [
    form.labelWidthMm,
    form.labelHeightMm,
    form.pageMarginTop,
    form.pageMarginSide,
    form.sheetGap,
    form.printMode,
    form.sheetLayout,
    form.density,
    form.showQr,
    form.showNote,
    form.showOrderNo,
    form.showReference,
    form.showWeight,
    form.showDistance,
    form.showDeliveryTime,
    form.brandName,
    form.labelTitle,
    form.senderName,
    form.senderAddress,
    form.recipientName,
    form.recipientAddress,
    form.orderNo,
    form.reference,
    form.weightValue,
    form.distanceValue,
    form.note,
    form.borderWidth,
    scale,
    previewOffset
  ]);

  const updateField = (key, value) => {
    setForm(current => {
      const next = { ...current, [key]: value };

      if (key === "sizePreset") {
        const preset = presetSizes[value];
        if (preset) {
          next.labelWidthMm = preset.width;
          next.labelHeightMm = preset.height;
        }
      }

      if (key === "templateName" && current.templateName !== value && activeTemplate && templates[activeTemplate] && !isBuiltInTemplate(activeTemplate)) {
        setTemplates(existing => ({
          ...existing,
          [activeTemplate]: {
            ...existing[activeTemplate],
            name: value.trim() || "Benim Sablonum"
          }
        }));
      }

      if (["printMode", "sheetLayout", "sizePreset", "labelWidthMm", "labelHeightMm", "pageMarginTop", "pageMarginSide", "sheetGap"].includes(key)) {
        setPreviewOffset({ x: 0, y: 0 });
      }

      return next;
    });
  };

  const applyTemplate = key => {
    const template = templates[key];
    if (!template) {
      return;
    }

    setActiveTemplate(key);
    setScale(1);
    setPreviewOffset({ x: 0, y: 0 });
    setForm(current => ({
      ...current,
      templateName: template.name || "Benim Sablonum",
      ...template
    }));
  };

  const applyBlankTemplate = () => {
    setActiveTemplate("shipping");
    setScale(1);
    setPreviewOffset({ x: 0, y: 0 });
    setForm({
      ...buildInitialForm(),
      ...blankTemplate,
      templateName: "Bos Etiket",
      senderName: "",
      senderAddress: "",
      recipientName: "",
      recipientAddress: "",
      orderNo: "",
      reference: "",
      weightValue: "",
      weightUnit: "KG",
      distanceValue: "",
      distanceUnit: "KM",
      deliveryTime: "",
      deliveryType: "",
      deliveryWindow: "",
      barcodeText: "",
      note: ""
    });
    scannerValueRef.current = "";
    setScannerInput("");
    window.requestAnimationFrame(() => scannerInputRef.current?.focus());
  };

  const startWithTemplate = key => {
    applyTemplate(key);
    setShowStartupOverlay(false);
    window.requestAnimationFrame(() => scannerInputRef.current?.focus());
  };

  const startWithBlankLabel = () => {
    applyBlankTemplate();
    setShowStartupOverlay(false);
  };

  const buildCustomTemplatePayload = () => ({
    name: form.templateName.trim() || "Benim Sablonum",
    description: "Kaydedilen ozel gorunum.",
    brandName: form.brandName,
    labelTitle: form.labelTitle,
    accentColor: form.accentColor,
    backgroundColor: form.backgroundColor,
    textColor: form.textColor,
    borderColor: form.borderColor,
    borderWidth: Number(form.borderWidth),
    density: form.density,
    showQr: form.showQr,
    showNote: form.showNote,
    highlightRecipient: form.highlightRecipient,
    showOrderNo: form.showOrderNo,
    showReference: form.showReference,
    showWeight: form.showWeight,
    showDistance: form.showDistance,
    showDeliveryTime: form.showDeliveryTime,
    printMode: form.printMode,
    sheetLayout: form.sheetLayout,
    sizePreset: form.sizePreset,
    labelWidthMm: Number(form.labelWidthMm),
    labelHeightMm: Number(form.labelHeightMm),
    pageMarginTop: Number(form.pageMarginTop),
    pageMarginSide: Number(form.pageMarginSide),
    sheetGap: Number(form.sheetGap),
    logoDataUrl: form.logoDataUrl || ""
  });

  const collectContentState = () => ({
    senderName: form.senderName,
    senderAddress: form.senderAddress,
    recipientName: form.recipientName,
    recipientAddress: form.recipientAddress,
    orderNo: form.orderNo,
    reference: form.reference,
    weightValue: form.weightValue,
    weightUnit: form.weightUnit,
    distanceValue: form.distanceValue,
    distanceUnit: form.distanceUnit,
    deliveryTime: form.deliveryTime,
    deliveryType: form.deliveryType,
    deliveryWindow: form.deliveryWindow,
    barcodeText: form.barcodeText,
    note: form.note
  });

  const saveTemplateFile = payload => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const safeName = slugify(payload.template?.name || payload.template?.templateName || "benim-sablonum");
    link.href = url;
    link.download = `label-settings-${safeName}-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const upsertCustomTemplate = template => {
    const key = isBuiltInTemplate(activeTemplate) ? "custom" : activeTemplate;
    setTemplates(current => ({ ...current, [key]: template }));
    setActiveTemplate(key);
  };

  const saveCurrentTemplateToFile = () => {
    const template = buildCustomTemplatePayload();
    upsertCustomTemplate(template);
    saveTemplateFile({
      version: 2,
      savedAt: new Date().toISOString(),
      activeTemplate: "custom",
      template,
      content: collectContentState()
    });
  };

  const saveCurrentTemplateToLibrary = () => {
    const template = buildCustomTemplatePayload();
    const key = slugify(template.name);
    setTemplates(current => ({ ...current, [key]: template }));
    setActiveTemplate(key);
  };

  const clearTemplateLibrary = () => {
    const customKeys = Object.keys(templates).filter(key => !isBuiltInTemplate(key));
    if (!customKeys.length || !window.confirm("Kutuphane icindeki tum ozel sablonlar silinsin mi?")) {
      return;
    }

    const nextTemplates = { ...templates };
    customKeys.forEach(key => delete nextTemplates[key]);
    setTemplates(nextTemplates);
    applyTemplate("shipping");
  };

  const deleteCurrentTemplate = () => {
    if (isBuiltInTemplate(activeTemplate)) {
      window.alert("Hazir sablonlar silinemez.");
      return;
    }

    const template = templates[activeTemplate];
    if (!template) {
      return;
    }

    if (!window.confirm(`"${template.name}" sablonunu silmek istiyor musun?`)) {
      return;
    }

    const nextTemplates = { ...templates };
    delete nextTemplates[activeTemplate];
    setTemplates(nextTemplates);
    applyTemplate("shipping");
  };

  const handleLogoUpload = event => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoDataUrl", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const commitScannedBarcode = () => {
    const scannedValue = scannerValueRef.current.trim();
    if (!scannedValue) {
      return;
    }

    updateField("barcodeText", scannedValue);
    scannerValueRef.current = "";
    setScannerInput("");
    window.requestAnimationFrame(() => scannerInputRef.current?.focus());
  };

  const onScannerInput = value => {
    scannerValueRef.current = value;
    setScannerInput(value);
    window.clearTimeout(scannerTimerRef.current);
    scannerTimerRef.current = window.setTimeout(commitScannedBarcode, 120);
  };

  const clearScannedBarcode = () => {
    updateField("barcodeText", "");
    scannerValueRef.current = "";
    setScannerInput("");
    window.requestAnimationFrame(() => scannerInputRef.current?.focus());
  };

  const applyLoadedSettings = data => {
    const styleState = data.template || data.style || {};
    const contentState = data.content || {};

    if (!Object.keys(styleState).length && !Object.keys(contentState).length) {
      window.alert("JSON icinde yuklenecek ayar bulunamadi.");
      return;
    }

    const merged = {
      ...form,
      ...styleState,
      ...contentState,
      templateName: styleState.name || styleState.templateName || form.templateName,
      logoDataUrl: styleState.logoDataUrl || ""
    };

    setForm(merged);
    upsertCustomTemplate({
      name: styleState.name || styleState.templateName || "Benim Sablonum",
      description: styleState.description || "Disaridan yuklenen ozel gorunum.",
      brandName: merged.brandName,
      labelTitle: merged.labelTitle,
      accentColor: merged.accentColor,
      backgroundColor: merged.backgroundColor,
      textColor: merged.textColor,
      borderColor: merged.borderColor,
      borderWidth: Number(merged.borderWidth),
      density: merged.density,
      showQr: merged.showQr,
      showNote: merged.showNote,
      highlightRecipient: merged.highlightRecipient,
      showOrderNo: merged.showOrderNo,
      showReference: merged.showReference,
      showWeight: merged.showWeight,
      showDistance: merged.showDistance,
      showDeliveryTime: merged.showDeliveryTime,
      printMode: merged.printMode,
      sheetLayout: merged.sheetLayout,
      sizePreset: merged.sizePreset,
      labelWidthMm: Number(merged.labelWidthMm),
      labelHeightMm: Number(merged.labelHeightMm),
      pageMarginTop: Number(merged.pageMarginTop),
      pageMarginSide: Number(merged.pageMarginSide),
      sheetGap: Number(merged.sheetGap),
      logoDataUrl: merged.logoDataUrl || ""
    });
  };

  const loadTemplateFromFile = async event => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      applyLoadedSettings(JSON.parse(text));
    } catch {
      window.alert("Secilen JSON dosyasi okunamadi.");
    } finally {
      event.target.value = "";
    }
  };

  const buildBarcodeCanvas = async value => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, value || "0000000000", {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      height: 70,
      margin: 0
    });

    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    return new Promise(resolve => {
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.src = url;
    });
  };

  const buildQrImage = async value => {
    if (!form.showQr) {
      return null;
    }

    return QRCode.toDataURL(value || "0000000000", { width: 180, margin: 0 });
  };

  const drawTextBlock = (pdf, title, strongText, bodyText, x, y, width, textRgb, highlight = false, accentColor = form.accentColor) => {
    const pad = 0.12;
    const left = x + pad;
    const right = x + width - pad;

    if (highlight) {
      pdf.setFillColor(...hexToRgb(hexToRgbaHex(accentColor, 0.12)));
      pdf.roundedRect(left, y + 0.02, width - (pad * 2), 0.86, 0.04, 0.04, "F");
    }

    pdf.setTextColor(...textRgb);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(title, left, y + 0.12);
    pdf.setFontSize(highlight ? 13 : 10);
    pdf.text(String(strongText || "-"), left, y + 0.28);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const lines = wrapText(pdf, bodyText || "-", (right - left) * 72);
    pdf.text(lines, left, y + 0.43);
    pdf.line(left, y + 0.78, right, y + 0.78);
    return y + 0.88;
  };

  const drawVectorLabelWithAssets = (pdf, state, x, y, w, h, barcodeData, qrData) => {
    const pad = 0.12;
    const accent = hexToRgb(state.accentColor);
    const border = hexToRgb(state.borderColor);
    const text = hexToRgb(state.textColor);

    pdf.setFillColor(...hexToRgb(state.backgroundColor));
    pdf.setDrawColor(...border);
    pdf.setLineWidth(0.02);
    pdf.roundedRect(x, y, w, h, 0.05, 0.05, "FD");

    let cursorY = y + pad;

    if (state.logoDataUrl) {
      pdf.addImage(state.logoDataUrl, "PNG", x + pad, cursorY, 0.7, 0.28, undefined, "FAST");
    } else {
      pdf.setTextColor(...accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(state.brandName, x + pad, cursorY + 0.13);
    }

    pdf.setTextColor(...accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(state.labelTitle, x + w - pad, cursorY + 0.12, { align: "right" });

    cursorY += 0.3;
    pdf.setDrawColor(...text);
    pdf.line(x + pad, cursorY, x + w - pad, cursorY);
    cursorY += 0.08;

    cursorY = drawTextBlock(pdf, "GONDEREN", state.senderName, state.senderAddress, x, cursorY, w, text, false, state.accentColor);
    cursorY = drawTextBlock(pdf, "ALICI", state.recipientName, state.recipientAddress, x, cursorY, w, text, state.highlightRecipient, state.accentColor);

    const stats = getPrimaryStats(state);
    if (stats.length) {
      const statWidth = (w - (pad * 2)) / stats.length;
      pdf.line(x + pad, cursorY, x + w - pad, cursorY);
      stats.forEach((stat, index) => {
        const sx = x + pad + (statWidth * index);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text(stat[0], sx + 0.03, cursorY + 0.14);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(String(stat[1] || "-"), sx + 0.03, cursorY + 0.28);
        if (index < stats.length - 1) {
          pdf.line(sx + statWidth, cursorY, sx + statWidth, cursorY + 0.36);
        }
      });
      cursorY += 0.4;
    }

    const secondaryStats = getSecondaryStats(state);
    if (secondaryStats.length) {
      const statWidth = (w - (pad * 2)) / secondaryStats.length;
      pdf.line(x + pad, cursorY, x + w - pad, cursorY);
      secondaryStats.forEach((stat, index) => {
        const sx = x + pad + (statWidth * index);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text(stat[0], sx + 0.03, cursorY + 0.14);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(String(stat[1] || "-"), sx + 0.03, cursorY + 0.28);
        if (index < secondaryStats.length - 1) {
          pdf.line(sx + statWidth, cursorY, sx + statWidth, cursorY + 0.36);
        }
      });
      cursorY += 0.4;
    }

    pdf.addImage(barcodeData, "PNG", x + pad, cursorY + 0.05, w - (pad * 2), 0.8, undefined, "FAST");
    cursorY += 0.95;

    if (state.showQr || state.showNote) {
      pdf.line(x + pad, cursorY, x + w - pad, cursorY);
      cursorY += 0.08;
    }

    if (state.showQr && qrData) {
      pdf.addImage(qrData, "PNG", x + pad, cursorY, 0.72, 0.72, undefined, "FAST");
    }

    if (state.showNote) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("TESLIMAT NOTU", x + pad + (state.showQr ? 0.82 : 0), cursorY + 0.12);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const noteLines = wrapText(pdf, state.note || "-", (w - (pad * 2) - (state.showQr ? 0.9 : 0)) * 72);
      pdf.text(noteLines, x + pad + (state.showQr ? 0.82 : 0), cursorY + 0.25);
    }
  };

  const createPdfDocument = async () => {
    const state = printableState;
    const pageFormat = state.printMode === "a4" ? "a4" : [mmToInch(state.labelWidthMm), mmToInch(state.labelHeightMm)];
    const orientation = state.printMode === "a4" ? "portrait" : (state.labelWidthMm > state.labelHeightMm ? "landscape" : "portrait");
    const pdf = new jsPDF({ orientation, unit: "in", format: pageFormat, compress: false });
    const barcodeCanvas = await buildBarcodeCanvas(state.barcodeText || "0000000000");
    const barcodeData = barcodeCanvas.toDataURL("image/png");
    const qrData = state.showQr ? await buildQrImage(state.barcodeText || "0000000000") : null;

    if (state.printMode === "a4") {
      const cols = state.sheetLayout === "2x2" ? 2 : state.sheetLayout === "3x2" ? 2 : 1;
      const rows = state.sheetLayout === "2x2" ? 2 : state.sheetLayout === "3x2" ? 3 : 1;
      const labelWidth = mmToInch(state.labelWidthMm);
      const labelHeight = mmToInch(state.labelHeightMm);
      const marginTop = mmToInch(state.pageMarginTop);
      const marginSide = mmToInch(state.pageMarginSide);
      const gap = mmToInch(state.sheetGap);

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = marginSide + col * (labelWidth + gap);
          const y = marginTop + row * (labelHeight + gap);
          if (x + labelWidth <= 8.27 && y + labelHeight <= 11.69) {
            drawVectorLabelWithAssets(pdf, state, x, y, labelWidth, labelHeight, barcodeData, qrData);
          }
        }
      }
    } else {
      drawVectorLabelWithAssets(
        pdf,
        state,
        0,
        0,
        mmToInch(state.labelWidthMm),
        mmToInch(state.labelHeightMm),
        barcodeData,
        qrData
      );
    }

    return pdf;
  };

  const downloadPdf = async () => {
    const pdf = await createPdfDocument();
    pdf.save("shipping-label.pdf");
  };

  const exportZpl = () => {
    setZplOutput(`
^XA
^PW812
^LL1218
^CF0,35
^FO40,40^FD${safe(form.brandName)} - ${safe(form.labelTitle)}^FS
^FO40,90^FD${safe(form.senderName)}^FS
^FO40,135^FD${safe(form.senderAddress).replace(/\n/g, " ")}^FS
^FO40,220^GB730,3,3^FS
^CF0,45
^FO40,255^FDALICI:^FS
^CF0,55
^FO40,315^FD${safe(form.recipientName)}^FS
^CF0,32
^FO40,385^FD${safe(form.recipientAddress).replace(/\n/g, " ")}^FS
^FO40,490^GB730,3,3^FS
^CF0,30
^FO40,530^FDSiparis No: ${safe(form.orderNo)}^FS
^FO40,575^FDReferans: ${safe(form.reference)}^FS
^FO40,620^FDAgirlik: ${safe(weightText)}^FS
^FO40,665^FDMesafe: ${safe(distanceText)}^FS
^FO40,710^FDTeslimat: ${safe(deliveryTimeText)}^FS
^FO40,755^FDTip: ${safe(deliveryTypeText)}^FS
^FO80,820^BY3
^BCN,130,Y,N,N
^FD${safe(form.barcodeText)}^FS
^FO40,1010^GB730,3,3^FS
^CF0,30
^FO40,1055^FDTeslimat Notu:^FS
^FO40,1100^FD${safe(form.note)}^FS
^XZ
`.trim());
  };

  const changeSize = value => {
    setScale(current => clamp(current + value * 0.05, 0.5, 1.5));
  };

  const startDrag = event => {
    if (event.button !== 0) {
      return;
    }

    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: previewOffset.x,
      originY: previewOffset.y
    });
    labelRef.current?.classList.add("dragging");
  };

  const moveDrag = event => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setPreviewOffset({
      x: dragState.originX + (event.clientX - dragState.startX),
      y: dragState.originY + (event.clientY - dragState.startY)
    });
  };

  const endDrag = event => {
    if (!dragState || (event.pointerId !== undefined && dragState.pointerId !== event.pointerId)) {
      return;
    }

    labelRef.current?.classList.remove("dragging");
    setDragState(null);
  };

  useEffect(() => {
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  });

  const renderInput = (id, label, type = "text", extra = {}) => (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={form[id]}
        onChange={event => updateField(id, type === "number" || type === "range" ? event.target.value : event.target.value)}
        {...extra}
      />
    </>
  );

  return (
    <>
      {showStartupOverlay && (
        <div id="startupOverlay" className="startup-overlay">
          <div className="startup-dialog">
            <p className="eyebrow">Hos Geldin</p>
            <h1>Etikete nasil baslamak istersin?</h1>
            <p className="panel-copy">Bos bir etiketle sifirdan ilerleyebilir ya da hazir sablonlardan biriyle hizli baslayabilirsin.</p>
            <div className="startup-grid">
              <StartupCard title="Bos Etiket" description="Sifirdan kendi duzenini kurmak isteyenler icin temiz baslangic." onClick={startWithBlankLabel}>
                <div className="blank-sheet"></div>
              </StartupCard>
              <StartupCard title="Sevkiyat Etiketi" description="Cikis, sevk ve dagitim operasyonlari icin genel sevkiyat duzeni." templateKey="shipping" onClick={() => startWithTemplate("shipping")}>
                <div className="mini-label"><div className="mini-top"></div><div className="mini-block"></div><div className="mini-block accent"></div><div className="mini-grid"></div><div className="mini-barcode"></div></div>
              </StartupCard>
              <StartupCard title="Kargo Etiketi" description="Kurye ve kargo teslimatlari icin barkod agirlikli standart kurgu." templateKey="cargo" onClick={() => startWithTemplate("cargo")}>
                <div className="mini-label"><div className="mini-top teal"></div><div className="mini-block"></div><div className="mini-grid"></div><div className="mini-barcode"></div></div>
              </StartupCard>
              <StartupCard title="Mal Kabul Etiketi" description="Giris kabul, urun kontrol ve depo kabul surecleri icin net alanlar." templateKey="receiving" onClick={() => startWithTemplate("receiving")}>
                <div className="mini-label soft"><div className="mini-top purple"></div><div className="mini-block accent soft-accent"></div><div className="mini-block"></div></div>
              </StartupCard>
              <StartupCard title="Iade Etiketi" description="Iade urunlerin ayrisma ve geri donus surecleri icin hizli tanimlama." templateKey="return" onClick={() => startWithTemplate("return")}>
                <div className="mini-label"><div className="mini-top red"></div><div className="mini-grid"></div><div className="mini-barcode"></div><div className="mini-block"></div></div>
              </StartupCard>
              <StartupCard title="Depo Transfer Etiketi" description="Lokasyonlar arasi urun hareketlerinde koli ve palet takibi icin." templateKey="transfer" onClick={() => startWithTemplate("transfer")}>
                <div className="mini-label"><div className="mini-top red"></div><div className="mini-block"></div><div className="mini-grid"></div><div className="mini-block accent"></div></div>
              </StartupCard>
              <StartupCard title="Palet Etiketi" description="Palet sevki, depo toplama ve saha takip operasyonlari icin buyuk barkodlu yapi." templateKey="pallet" onClick={() => startWithTemplate("pallet")}>
                <div className="mini-label"><div className="mini-top teal"></div><div className="mini-block accent"></div><div className="mini-grid"></div><div className="mini-barcode"></div></div>
              </StartupCard>
            </div>
          </div>
        </div>
      )}

      <div className="app">
        <aside className="panel">
          <div className="panel-header">
            <p className="eyebrow">Etiket Tasarim Studyo</p>
            <h1>Shipping Label</h1>
            <p className="panel-copy">A4 onizleme, okutucu girisi, coklu etiket listesi ve sablon kutuphanesi ile baskiya hazir etiket uret.</p>
          </div>

          <section className="panel-section">
            <div className="section-head">
              <h2>Sablonlar</h2>
              <div className="action-group">
                <button className="ghost-button danger-button" type="button" onClick={deleteCurrentTemplate} disabled={isBuiltInTemplate(activeTemplate)}>Sablonu Sil</button>
                <button className="ghost-button" type="button" onClick={() => templateInputRef.current?.click()}>Ayar Yukle</button>
                <button className="ghost-button" type="button" onClick={saveCurrentTemplateToFile}>JSON Kaydet</button>
              </div>
            </div>
            <label htmlFor="templateName">Template Adi</label>
            <input id="templateName" value={form.templateName} onChange={event => updateField("templateName", event.target.value)} placeholder="Ornek: Trendyol XL Etiketi" />
            <div className="row tight-row">
              <button type="button" onClick={saveCurrentTemplateToLibrary}>Kutuphane'ye Ekle</button>
              <button type="button" className="ghost-button" onClick={clearTemplateLibrary} disabled={!Object.keys(templates).some(key => !isBuiltInTemplate(key))}>Kutuphane Temizle</button>
            </div>
            <div className="template-grid">
              {Object.entries(templates).map(([key, template]) => (
                <button key={key} type="button" className={`template-card ${activeTemplate === key ? "active" : ""}`} onClick={() => applyTemplate(key)}>
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
            <input ref={templateInputRef} type="file" accept="application/json,.json" className="hidden" onChange={loadTemplateFromFile} />
          </section>

          <section className="panel-section">
            <h2>Baski ve Sayfa</h2>
            <div className="inline-fields">
              <div>
                <label htmlFor="printMode">Baski Modu</label>
                <select id="printMode" value={form.printMode} onChange={event => updateField("printMode", event.target.value)}>
                  <option value="thermal">Termal Etiket</option>
                  <option value="a4">A4 Cikti</option>
                </select>
              </div>
              <div>
                <label htmlFor="sheetLayout">Yerlesim</label>
                <select id="sheetLayout" value={form.sheetLayout} onChange={event => updateField("sheetLayout", event.target.value)}>
                  <option value="single">Tek Etiket</option>
                  <option value="2x2">2 x 2</option>
                  <option value="3x2">3 x 2</option>
                </select>
              </div>
            </div>
            <div className="inline-fields triple">
              <div>
                <label htmlFor="sizePreset">Olcu Preseti</label>
                <select id="sizePreset" value={form.sizePreset} onChange={event => updateField("sizePreset", event.target.value)}>
                  <option value="4x6">4 x 6 inch</option>
                  <option value="100x150">100 x 150 mm</option>
                  <option value="a6">A6</option>
                  <option value="custom">Ozel</option>
                </select>
              </div>
              <div>{renderInput("labelWidthMm", "Genislik (mm)", "number", { min: 40, max: 210, step: 0.1 })}</div>
              <div>{renderInput("labelHeightMm", "Yukseklik (mm)", "number", { min: 40, max: 297, step: 0.1 })}</div>
            </div>
            <div className="inline-fields triple">
              <div>{renderInput("pageMarginTop", "Ust Bosluk (mm)", "number", { min: 0, max: 40, step: 1 })}</div>
              <div>{renderInput("pageMarginSide", "Yan Bosluk (mm)", "number", { min: 0, max: 40, step: 1 })}</div>
              <div>{renderInput("sheetGap", "Hucre Boslugu (mm)", "number", { min: 0, max: 20, step: 1 })}</div>
            </div>
          </section>

          <section className="panel-section">
            <h2>Marka ve Gorunum</h2>
            {renderInput("brandName", "Logo / Marka")}
            <label>Logo Gorseli</label>
            <div className="row tight-row">
              <button type="button" className="ghost-button" onClick={() => logoInputRef.current?.click()}>Logo Yukle</button>
              <button type="button" className="ghost-button" onClick={() => updateField("logoDataUrl", "")}>Logo Kaldir</button>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <p className="scan-hint">{logoStatus}</p>
            {renderInput("labelTitle", "Baslik")}
            <div className="color-grid">
              <div>{renderInput("accentColor", "Vurgu Rengi", "color")}</div>
              <div>{renderInput("backgroundColor", "Zemin", "color")}</div>
              <div>{renderInput("textColor", "Yazi", "color")}</div>
              <div>{renderInput("borderColor", "Kenar", "color")}</div>
            </div>
            <div className="inline-fields">
              <div>{renderInput("borderWidth", "Kenar Kalinligi", "range", { min: 1, max: 8 })}</div>
              <div>
                <label htmlFor="density">Yogunluk</label>
                <select id="density" value={form.density} onChange={event => updateField("density", event.target.value)}>
                  <option value="comfortable">Rahat</option>
                  <option value="compact">Kompakt</option>
                </select>
              </div>
            </div>
            <div className="option-group">
              <h3>Gorsel Tercihler</h3>
              <div className="toggle-grid">
                {[
                  ["showQr", "QR goster"],
                  ["showNote", "Teslimat notu goster"],
                  ["highlightRecipient", "Aliciyi vurgula"]
                ].map(([key, text]) => (
                  <label key={key} className="toggle"><input type="checkbox" checked={form[key]} onChange={event => updateField(key, event.target.checked)} /><span>{text}</span></label>
                ))}
              </div>
            </div>
            <div className="option-group">
              <h3>Lojistik Alanlar</h3>
              <div className="toggle-grid">
                {[
                  ["showOrderNo", "Siparis no goster"],
                  ["showReference", "Referans goster"],
                  ["showWeight", "Agirlik goster"],
                  ["showDistance", "Mesafe goster"],
                  ["showDeliveryTime", "Teslimat zamani goster"]
                ].map(([key, text]) => (
                  <label key={key} className="toggle"><input type="checkbox" checked={form[key]} onChange={event => updateField(key, event.target.checked)} /><span>{text}</span></label>
                ))}
              </div>
            </div>
          </section>

          <section className="panel-section">
            <h2>Icerik</h2>
            {renderInput("senderName", "Gonderen")}
            <label htmlFor="senderAddress">Gonderen Adres</label>
            <textarea id="senderAddress" value={form.senderAddress} onChange={event => updateField("senderAddress", event.target.value)} />
            {renderInput("recipientName", "Alici")}
            <label htmlFor="recipientAddress">Alici Adres</label>
            <textarea id="recipientAddress" value={form.recipientAddress} onChange={event => updateField("recipientAddress", event.target.value)} />
            <div className="inline-fields triple">
              <div>{renderInput("orderNo", "Siparis No")}</div>
              <div>{renderInput("reference", "Referans")}</div>
              <div>{renderInput("weightValue", "Agirlik", "number", { min: 0, step: 0.01 })}</div>
            </div>
            <div className="inline-fields triple">
              <div>
                <label htmlFor="weightUnit">Agirlik Birimi</label>
                <select id="weightUnit" value={form.weightUnit} onChange={event => updateField("weightUnit", event.target.value)}>
                  <option value="KG">KG</option>
                  <option value="G">G</option>
                  <option value="LB">LB</option>
                </select>
              </div>
              <div>{renderInput("distanceValue", "Mesafe", "number", { min: 0, step: 0.1 })}</div>
              <div>
                <label htmlFor="distanceUnit">Mesafe Birimi</label>
                <select id="distanceUnit" value={form.distanceUnit} onChange={event => updateField("distanceUnit", event.target.value)}>
                  <option value="KM">KM</option>
                  <option value="MI">MI</option>
                  <option value="M">M</option>
                </select>
              </div>
            </div>
            <div className="inline-fields triple">
              <div>{renderInput("deliveryTime", "Teslimat Zamani", "datetime-local")}</div>
              <div>{renderInput("deliveryType", "Teslimat Tipi")}</div>
              <div>{renderInput("deliveryWindow", "Teslimat Suresi")}</div>
            </div>
            <div className="scan-card">
              <div className="scan-head">
                <label htmlFor="barcodeScannerInput">Barkod Okut</label>
                <div className="scan-actions">
                  <button className="ghost-button" type="button" onClick={() => scannerInputRef.current?.focus()}>Okutucuya Hazirla</button>
                  <button className="ghost-button" type="button" onClick={clearScannedBarcode}>Temizle</button>
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
                    window.clearTimeout(scannerTimerRef.current);
                    commitScannedBarcode();
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
            <textarea id="note" value={form.note} onChange={event => updateField("note", event.target.value)} />
          </section>

          <section className="panel-section">
            <h2>Disa Aktar</h2>
            <div className="row tight-row">
              <button type="button" onClick={() => changeSize(1)}>+1 Buyut</button>
              <button type="button" onClick={() => changeSize(-1)}>-1 Kucult</button>
            </div>
            <div className="row tight-row">
              <button type="button" onClick={downloadPdf}>Vektor PDF</button>
              <button type="button" onClick={() => window.print()}>Yazdir</button>
            </div>
            <button type="button" onClick={exportZpl}>ZPL Olustur</button>
            <textarea value={zplOutput} onChange={event => setZplOutput(event.target.value)} placeholder="ZPL ciktisi burada olusur..." />
          </section>
        </aside>

        <main className="preview-wrap">
          <div className="preview-meta">
            <div>
              <p className="eyebrow">Canli Onizleme</p>
              <h2>{previewModeTitle}</h2>
            </div>
            <p className="panel-copy compact-copy">{previewModeCopy}</p>
          </div>

          <section className="sheet-preview">
            <div
              className={`sheet-page layout-${layout} ${form.printMode === "thermal" ? "thermal-stage" : ""}`}
              style={{
                paddingTop: form.printMode === "thermal" ? "24px" : `${Math.max(4, Number(form.pageMarginTop) / 2)}%`,
                paddingLeft: form.printMode === "thermal" ? "24px" : `${Math.max(4, Number(form.pageMarginSide) / 2)}%`,
                paddingRight: form.printMode === "thermal" ? "24px" : `${Math.max(4, Number(form.pageMarginSide) / 2)}%`,
                paddingBottom: form.printMode === "thermal" ? "24px" : `${Math.max(4, Number(form.pageMarginTop) / 2)}%`,
                gap: `${Math.max(8, Number(form.sheetGap) * 1.4)}px`
              }}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  ref={index === 0 ? activeSlotRef : null}
                  className={`sheet-slot ${index === 0 ? "active-slot" : ""} ${index >= slotCount ? "hidden" : ""}`}
                >
                  {index === 0 ? (
                    <section
                      id="label"
                      ref={labelRef}
                      className={`label ${form.density === "compact" ? "compact" : ""}`}
                      onPointerDown={startDrag}
                      style={{
                        width: `${form.labelWidthMm}mm`,
                        height: `${form.labelHeightMm}mm`,
                        maxWidth: "100%",
                        backgroundColor: form.backgroundColor,
                        color: form.textColor,
                        borderColor: form.borderColor,
                        borderWidth: `${form.borderWidth}px`,
                        transform: previewTransform,
                        ["--recipient-accent"]: hexToRgba(form.accentColor, 0.14)
                      }}
                    >
                      <div className="top">
                        <div className="logo-wrap">
                          {form.logoDataUrl ? <img className="logo-image" alt="Logo" src={form.logoDataUrl} /> : <div className="logo" style={{ color: form.accentColor }}>{form.brandName}</div>}
                        </div>
                        <div className="cargo" style={{ color: form.accentColor }}>{form.labelTitle}</div>
                      </div>
                      <div className="block">
                        <small>GONDEREN</small>
                        <strong>{form.senderName}</strong>
                        <p>{form.senderAddress}</p>
                      </div>
                      <div className={`block recipient ${form.highlightRecipient ? "highlighted" : ""}`} style={{ borderColor: form.highlightRecipient ? form.accentColor : "transparent" }}>
                        <small>ALICI</small>
                        <strong>{form.recipientName}</strong>
                        <p>{form.recipientAddress}</p>
                      </div>
                      <div className={`grid ${visiblePrimaryCount <= 1 ? "single-stat" : ""} ${visiblePrimaryCount === 2 ? "two-stats" : ""}`}>
                        {form.showOrderNo && <div><small>SIPARIS NO</small><strong>{form.orderNo}</strong></div>}
                        {form.showReference && <div><small>REFERANS</small><strong>{form.reference}</strong></div>}
                        {form.showWeight && <div><small>AGIRLIK</small><strong>{weightText}</strong></div>}
                      </div>
                      {visibleSecondaryCount > 0 && (
                        <div className={`grid secondary-grid ${visibleSecondaryCount <= 1 ? "single-stat" : ""} ${visibleSecondaryCount === 2 ? "two-stats" : ""}`}>
                          {form.showDistance && <div><small>MESAFE</small><strong>{distanceText}</strong></div>}
                          {form.showDeliveryTime && <div><small>TESLIMAT</small><strong>{deliveryTimeText}</strong></div>}
                          {form.showDeliveryTime && <div><small>TIP</small><strong>{deliveryTypeText}</strong></div>}
                        </div>
                      )}
                      <svg ref={barcodeRef} id="barcode"></svg>
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
                  ) : (
                    <div className="slot-placeholder">Bos hucre</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
