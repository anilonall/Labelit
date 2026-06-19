let scale = 1;
let activeTemplate = "shipping";
let scanCommitTimer;
let logoDataUrl = "";
let previewOffsetX = 0;
let previewOffsetY = 0;
let isDraggingLabel = false;
let dragPointerId = null;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;

const LIBRARY_KEY = "label-template-library-v1";
const builtInTemplateKeys = ["shipping", "cargo", "receiving", "return", "transfer", "pallet"];

const presetSizes = {
  "4x6": { width: 101.6, height: 152.4 },
  "100x150": { width: 100, height: 150 },
  a6: { width: 105, height: 148 },
  custom: null
};

const templates = {
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

const contentFields = [
  "senderName",
  "senderAddress",
  "recipientName",
  "recipientAddress",
  "orderNo",
  "reference",
  "weightValue",
  "weightUnit",
  "distanceValue",
  "distanceUnit",
  "deliveryTime",
  "deliveryType",
  "deliveryWindow",
  "barcodeText",
  "note"
];

const styleFields = [
  "templateName",
  "brandName",
  "labelTitle",
  "accentColor",
  "backgroundColor",
  "textColor",
  "borderColor",
  "borderWidth",
  "density",
  "showQr",
  "showNote",
  "highlightRecipient",
  "showOrderNo",
  "showReference",
  "showWeight",
  "showDistance",
  "showDeliveryTime",
  "printMode",
  "sheetLayout",
  "sizePreset",
  "labelWidthMm",
  "labelHeightMm",
  "pageMarginTop",
  "pageMarginSide",
  "sheetGap"
];

const refs = Object.fromEntries(
  [...contentFields, ...styleFields].map(id => [id, document.getElementById(id)])
);

const label = document.getElementById("label");
const labelTemplate = document.getElementById("labelTemplate");

initializeLabelMarkup();

function initializeLabelMarkup() {
  label.innerHTML = labelTemplate.innerHTML;
}

function isBuiltInTemplate(name) {
  return builtInTemplateKeys.includes(name);
}

function renderTemplateCards() {
  templateGrid.innerHTML = "";

  Object.entries(templates).forEach(([key, template]) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "template-card";
    card.dataset.template = key;
    card.innerHTML = `<strong>${template.name}</strong><span>${template.description}</span>`;
    card.addEventListener("click", () => applyTemplate(key));
    templateGrid.appendChild(card);
  });
}

function bindInputs() {
  [...contentFields, ...styleFields].forEach(id => {
    if (id === "barcodeText") {
      return;
    }

    const element = refs[id];
    const eventName = element.type === "checkbox" || element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventName, handleGeneralInput);
  });

  saveTemplate.addEventListener("click", saveCurrentTemplateToFile);
  saveLibraryTemplate.addEventListener("click", saveCurrentTemplateToLibrary);
  clearLibrary.addEventListener("click", clearTemplateLibrary);
  deleteTemplate.addEventListener("click", deleteCurrentTemplate);
  loadTemplate.addEventListener("click", () => templateFileInput.click());
  templateFileInput.addEventListener("change", loadTemplateFromFile);

  uploadLogo.addEventListener("click", () => logoFileInput.click());
  removeLogo.addEventListener("click", removeLogoImage);
  logoFileInput.addEventListener("change", handleLogoUpload);

  focusScanner.addEventListener("click", focusScannerInput);
  clearBarcode.addEventListener("click", clearScannedBarcode);
  barcodeScannerInput.addEventListener("input", handleScannerInput);
  barcodeScannerInput.addEventListener("keydown", handleScannerKeydown);

  startBlank.addEventListener("click", startWithBlankLabel);
  document.querySelectorAll("[data-start-template]").forEach(button => {
    button.addEventListener("click", () => startWithTemplate(button.dataset.startTemplate));
  });

  sheetPage.addEventListener("pointerdown", startLabelDrag);
  window.addEventListener("pointermove", handleLabelDrag);
  window.addEventListener("pointerup", endLabelDrag);
  window.addEventListener("pointercancel", endLabelDrag);
}

function startWithBlankLabel() {
  applyBlankTemplate();
  closeStartupOverlay();
}

function startWithTemplate(templateKey) {
  applyTemplate(templateKey);
  closeStartupOverlay();
}

function resetPreviewPosition() {
  previewOffsetX = 0;
  previewOffsetY = 0;
}

function closeStartupOverlay() {
  startupOverlay.classList.add("hidden");
  focusScannerInput();
}

function applyBlankTemplate() {
  activeTemplate = "shipping";
  resetPreviewPosition();
  refs.templateName.value = "Bos Etiket";
  logoDataUrl = "";

  Object.entries(blankTemplate).forEach(([key, value]) => {
    if (key === "name" || key === "description") {
      return;
    }

    if (!(key in refs)) {
      return;
    }

    const element = refs[key];
    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  });

  refs.senderName.value = "";
  refs.senderAddress.value = "";
  refs.recipientName.value = "";
  refs.recipientAddress.value = "";
  refs.orderNo.value = "";
  refs.reference.value = "";
  refs.weightValue.value = "";
  refs.weightUnit.value = "KG";
  refs.distanceValue.value = "";
  refs.distanceUnit.value = "KM";
  refs.deliveryTime.value = "";
  refs.deliveryType.value = "";
  refs.deliveryWindow.value = "";
  refs.barcodeText.value = "";
  refs.note.value = "";
  barcodeScannerInput.value = "";
  updateLogoStatus();
  updateLabel();
}

function handleGeneralInput(event) {
  if ([
    "printMode",
    "sheetLayout",
    "sizePreset",
    "labelWidthMm",
    "labelHeightMm",
    "pageMarginTop",
    "pageMarginSide",
    "sheetGap"
  ].includes(event.target.id)) {
    resetPreviewPosition();
  }

  if (event.target.id === "sizePreset") {
    applySizePreset(refs.sizePreset.value);
  }

  if (event.target.id === "templateName" && activeTemplate && templates[activeTemplate] && !isBuiltInTemplate(activeTemplate)) {
    templates[activeTemplate].name = refs.templateName.value.trim() || "Benim Sablonum";
    renderTemplateCards();
  }

  updateLabel();
}

function applyTemplate(name) {
  const template = templates[name];

  if (!template) {
    return;
  }

  activeTemplate = name;
  resetPreviewPosition();
  refs.templateName.value = template.name || "Benim Sablonum";
  logoDataUrl = template.logoDataUrl || "";

  styleFields.forEach(id => {
    const element = refs[id];
    const value = id === "templateName" ? template.name : template[id];

    if (value === undefined) {
      return;
    }

    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  });

  updateLogoStatus();
  updateLabel();
}

function collectStyleState() {
  return {
    templateName: refs.templateName.value,
    brandName: refs.brandName.value,
    labelTitle: refs.labelTitle.value,
    accentColor: refs.accentColor.value,
    backgroundColor: refs.backgroundColor.value,
    textColor: refs.textColor.value,
    borderColor: refs.borderColor.value,
    borderWidth: Number(refs.borderWidth.value),
    density: refs.density.value,
    showQr: refs.showQr.checked,
    showNote: refs.showNote.checked,
    highlightRecipient: refs.highlightRecipient.checked,
    showOrderNo: refs.showOrderNo.checked,
    showReference: refs.showReference.checked,
    showWeight: refs.showWeight.checked,
    showDistance: refs.showDistance.checked,
    showDeliveryTime: refs.showDeliveryTime.checked,
    printMode: refs.printMode.value,
    sheetLayout: refs.sheetLayout.value,
    sizePreset: refs.sizePreset.value,
    labelWidthMm: Number(refs.labelWidthMm.value),
    labelHeightMm: Number(refs.labelHeightMm.value),
    pageMarginTop: Number(refs.pageMarginTop.value),
    pageMarginSide: Number(refs.pageMarginSide.value),
    sheetGap: Number(refs.sheetGap.value),
    logoDataUrl
  };
}

function collectContentState() {
  return {
    senderName: refs.senderName.value,
    senderAddress: refs.senderAddress.value,
    recipientName: refs.recipientName.value,
    recipientAddress: refs.recipientAddress.value,
    orderNo: refs.orderNo.value,
    reference: refs.reference.value,
    weightValue: refs.weightValue.value,
    weightUnit: refs.weightUnit.value,
    distanceValue: refs.distanceValue.value,
    distanceUnit: refs.distanceUnit.value,
    deliveryTime: refs.deliveryTime.value,
    deliveryType: refs.deliveryType.value,
    deliveryWindow: refs.deliveryWindow.value,
    barcodeText: refs.barcodeText.value,
    note: refs.note.value
  };
}

function buildCustomTemplatePayload() {
  const templateName = refs.templateName.value.trim() || "Benim Sablonum";

  return {
    name: templateName,
    description: "Kaydedilen ozel gorunum.",
    ...collectStyleState(),
    logoDataUrl
  };
}

function saveCurrentTemplateToFile() {
  const template = buildCustomTemplatePayload();
  upsertCustomTemplate(template);
  downloadTemplateFile({
    version: 2,
    savedAt: new Date().toISOString(),
    activeTemplate: "custom",
    template,
    content: collectContentState()
  });
}

function saveCurrentTemplateToLibrary() {
  const template = buildCustomTemplatePayload();
  const key = slugify(template.name);

  templates[key] = template;
  activeTemplate = key;
  persistTemplateLibrary();
  renderTemplateCards();
  updateLabel();
}

function upsertCustomTemplate(template) {
  const key = isBuiltInTemplate(activeTemplate) ? "custom" : activeTemplate;
  templates[key] = template;
  activeTemplate = key;
  renderTemplateCards();
  updateLabel();
}

function persistTemplateLibrary() {
  const libraryTemplates = Object.fromEntries(
    Object.entries(templates).filter(([key]) => !isBuiltInTemplate(key))
  );

  localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryTemplates));
}

function loadTemplateLibrary() {
  const raw = localStorage.getItem(LIBRARY_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([key, template]) => {
      templates[key] = template;
    });
  } catch (error) {
    localStorage.removeItem(LIBRARY_KEY);
  }
}

function clearTemplateLibrary() {
  const customKeys = Object.keys(templates).filter(key => !isBuiltInTemplate(key));

  if (!customKeys.length) {
    return;
  }

  if (!window.confirm("Kutuphane icindeki tum ozel sablonlar silinsin mi?")) {
    return;
  }

  customKeys.forEach(key => delete templates[key]);
  persistTemplateLibrary();
  activeTemplate = "shipping";
  renderTemplateCards();
  applyTemplate(activeTemplate);
}

function updateTemplateSelection() {
  document.querySelectorAll(".template-card").forEach(card => {
    card.classList.toggle("active", card.dataset.template === activeTemplate);
  });

  deleteTemplate.disabled = isBuiltInTemplate(activeTemplate);
  clearLibrary.disabled = !Object.keys(templates).some(key => !isBuiltInTemplate(key));
  deleteTemplate.title = isBuiltInTemplate(activeTemplate)
    ? "Hazir sablonlar silinemez."
    : "Secili ozel sablonu sil.";
}

function deleteCurrentTemplate() {
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

  delete templates[activeTemplate];
  persistTemplateLibrary();
  activeTemplate = "shipping";
  renderTemplateCards();
  applyTemplate(activeTemplate);
}

function applySizePreset(preset) {
  const size = presetSizes[preset];

  if (!size) {
    return;
  }

  refs.labelWidthMm.value = size.width;
  refs.labelHeightMm.value = size.height;
}

function updateLogoStatus() {
  logoStatus.textContent = logoDataUrl
    ? "Logo gorseli yuklendi."
    : "Su an yazi logosu kullaniliyor.";
}

function handleLogoUpload(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    logoDataUrl = String(reader.result || "");
    updateLogoStatus();
    updateLabel();
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function removeLogoImage() {
  logoDataUrl = "";
  updateLogoStatus();
  updateLabel();
}

function formatMeasurement(value, unit) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  return `${normalized} ${unit}`.trim();
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

function updateLabel() {
  const widthMm = Number(refs.labelWidthMm.value) || 100;
  const heightMm = Number(refs.labelHeightMm.value) || 150;
  const weightText = formatMeasurement(refs.weightValue.value, refs.weightUnit.value);
  const distanceText = formatMeasurement(refs.distanceValue.value, refs.distanceUnit.value);
  const deliveryTimeText = formatDeliveryTime(refs.deliveryTime.value);
  const deliveryTypeText = [refs.deliveryType.value, refs.deliveryWindow.value].filter(Boolean).join(" / ");

  pBrandName.textContent = refs.brandName.value;
  pLabelTitle.textContent = refs.labelTitle.value;
  pSenderName.textContent = refs.senderName.value;
  pSenderAddress.textContent = refs.senderAddress.value;
  pRecipientName.textContent = refs.recipientName.value;
  pRecipientAddress.textContent = refs.recipientAddress.value;
  pOrderNo.textContent = refs.orderNo.value;
  pReference.textContent = refs.reference.value;
  pWeight.textContent = weightText;
  pDistance.textContent = distanceText;
  pDeliveryTime.textContent = deliveryTimeText;
  pDeliveryType.textContent = deliveryTypeText;
  pNote.textContent = refs.note.value;
  barcodeValueDisplay.textContent = refs.barcodeText.value || "Barkod bekleniyor";

  label.style.width = `${widthMm}mm`;
  label.style.height = `${heightMm}mm`;
  label.style.maxWidth = "100%";
  label.style.backgroundColor = refs.backgroundColor.value;
  label.style.color = refs.textColor.value;
  label.style.borderColor = refs.borderColor.value;
  label.style.borderWidth = `${refs.borderWidth.value}px`;
  label.classList.toggle("compact", refs.density.value === "compact");
  label.style.setProperty("--recipient-accent", hexToRgba(refs.accentColor.value, 0.14));

  recipientBlock.classList.toggle("highlighted", refs.highlightRecipient.checked);
  recipientBlock.style.borderColor = refs.highlightRecipient.checked ? refs.accentColor.value : "transparent";
  pBrandName.style.color = refs.accentColor.value;
  pLabelTitle.style.color = refs.accentColor.value;

  pLogoImage.src = logoDataUrl;
  pLogoImage.classList.toggle("hidden", !logoDataUrl);
  pBrandName.classList.toggle("hidden", Boolean(logoDataUrl));

  noteBlock.classList.toggle("hidden", !refs.showNote.checked);
  qrcode.classList.toggle("hidden", !refs.showQr.checked);
  bottomMeta.classList.toggle("no-qr", !refs.showQr.checked);
  bottomMeta.classList.toggle("hidden", !refs.showQr.checked && !refs.showNote.checked);

  orderCell.classList.toggle("hidden", !refs.showOrderNo.checked);
  referenceCell.classList.toggle("hidden", !refs.showReference.checked);
  weightCell.classList.toggle("hidden", !refs.showWeight.checked);
  distanceCell.classList.toggle("hidden", !refs.showDistance.checked);
  deliveryTimeCell.classList.toggle("hidden", !refs.showDeliveryTime.checked);
  deliveryTypeCell.classList.toggle("hidden", !refs.showDeliveryTime.checked);

  const primaryGrid = document.querySelector(".grid");
  const secondaryGrid = document.querySelector(".secondary-grid");
  const visibleStatCount = [refs.showOrderNo.checked, refs.showReference.checked, refs.showWeight.checked].filter(Boolean).length;
  const visibleSecondaryCount = [refs.showDistance.checked, refs.showDeliveryTime.checked, refs.showDeliveryTime.checked].filter(Boolean).length;
  primaryGrid.classList.toggle("single-stat", visibleStatCount <= 1);
  primaryGrid.classList.toggle("two-stats", visibleStatCount === 2);
  secondaryGrid.classList.toggle("single-stat", visibleSecondaryCount <= 1);
  secondaryGrid.classList.toggle("two-stats", visibleSecondaryCount === 2);
  secondaryGrid.classList.toggle("hidden", visibleSecondaryCount === 0);

  renderCodes();
  updateSheetPreview();
  updateTemplateSelection();
}

function renderCodes() {
  JsBarcode("#barcode", refs.barcodeText.value || "0000000000", {
    format: "CODE128",
    displayValue: true,
    fontSize: refs.density.value === "compact" ? 11 : 14,
    lineColor: refs.textColor.value,
    height: refs.density.value === "compact" ? 62 : 72,
    margin: 0
  });

  qrcode.innerHTML = "";

  if (refs.showQr.checked) {
    new QRCode(qrcode, {
      text: refs.barcodeText.value || "0000000000",
      width: refs.density.value === "compact" ? 72 : 85,
      height: refs.density.value === "compact" ? 72 : 85
    });
  }
}

function updateSheetPreview() {
  const layout = refs.printMode.value === "thermal" ? "single" : refs.sheetLayout.value;
  const gap = Number(refs.sheetGap.value) || 0;
  const marginTop = Number(refs.pageMarginTop.value) || 0;
  const marginSide = Number(refs.pageMarginSide.value) || 0;
  const widthMm = Number(refs.labelWidthMm.value) || 100;
  const heightMm = Number(refs.labelHeightMm.value) || 150;

  previewModeTitle.textContent = refs.printMode.value === "thermal" ? "Termal Etiket" : "A4 Sayfa Onizlemesi";
  previewModeCopy.textContent = refs.printMode.value === "thermal"
    ? `${widthMm.toFixed(1)} x ${heightMm.toFixed(1)} mm termal cikti gorunumu.`
    : `A4 sayfada ${refs.sheetLayout.value} yerlesimi, ${marginTop} mm ust ve ${marginSide} mm yan bosluk.`;

  sheetPage.className = "sheet-page";
  sheetPage.classList.add(`layout-${layout}`);
  sheetPage.classList.toggle("thermal-stage", refs.printMode.value === "thermal");
  sheetPage.style.paddingTop = refs.printMode.value === "thermal" ? "24px" : `${Math.max(4, marginTop / 2)}%`;
  sheetPage.style.paddingLeft = refs.printMode.value === "thermal" ? "24px" : `${Math.max(4, marginSide / 2)}%`;
  sheetPage.style.paddingRight = refs.printMode.value === "thermal" ? "24px" : `${Math.max(4, marginSide / 2)}%`;
  sheetPage.style.paddingBottom = refs.printMode.value === "thermal" ? "24px" : `${Math.max(4, marginTop / 2)}%`;
  sheetPage.style.gap = `${Math.max(8, gap * 1.4)}px`;

  const slotCount = layout === "single" ? 1 : layout === "2x2" ? 4 : 6;
  const slots = Array.from(sheetPage.querySelectorAll(".sheet-slot"));

  slots.forEach((slot, index) => {
    slot.classList.toggle("hidden", index >= slotCount);
    slot.classList.toggle("active-slot", index === 0);
  });

  window.requestAnimationFrame(updateSheetPageFrame);
  window.requestAnimationFrame(updatePreviewScale);
}

function updateSheetPageFrame() {
  const previewWidth = sheetPreview.clientWidth - 12;
  const previewHeight = sheetPreview.clientHeight - 12;

  if (!previewWidth || !previewHeight) {
    return;
  }

  if (refs.printMode.value === "thermal") {
    sheetPage.style.width = `${Math.min(previewWidth, 1220)}px`;
    sheetPage.style.height = `${Math.min(previewHeight, 940)}px`;
    return;
  }

  const pageRatio = 210 / 297;
  let pageWidth = Math.min(previewWidth, 820);
  let pageHeight = pageWidth / pageRatio;

  if (pageHeight > previewHeight) {
    pageHeight = previewHeight;
    pageWidth = pageHeight * pageRatio;
  }

  sheetPage.style.width = `${pageWidth}px`;
  sheetPage.style.height = `${pageHeight}px`;
}

function focusScannerInput() {
  barcodeScannerInput.focus();
  barcodeScannerInput.select();
}

function handleScannerInput() {
  window.clearTimeout(scanCommitTimer);
  scanCommitTimer = window.setTimeout(commitScannedBarcode, 120);
}

function handleScannerKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  window.clearTimeout(scanCommitTimer);
  commitScannedBarcode();
}

function commitScannedBarcode() {
  const scannedValue = barcodeScannerInput.value.trim();

  if (!scannedValue) {
    return;
  }

  refs.barcodeText.value = scannedValue;
  barcodeScannerInput.value = "";
  updateLabel();
  focusScannerInput();
}

function clearScannedBarcode() {
  refs.barcodeText.value = "";
  barcodeScannerInput.value = "";
  updateLabel();
  focusScannerInput();
}

function downloadTemplateFile(payload) {
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
}

async function loadTemplateFromFile(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    applyLoadedSettings(data);
  } catch (error) {
    window.alert("Secilen JSON dosyasi okunamadi.");
  } finally {
    event.target.value = "";
  }
}

function applyLoadedSettings(data) {
  const styleState = data.template || data.style || {};
  const contentState = data.content || {};

  if (!Object.keys(styleState).length && !Object.keys(contentState).length) {
    window.alert("JSON icinde yuklenecek ayar bulunamadi.");
    return;
  }

  Object.entries(styleState).forEach(([key, value]) => {
    if (key === "name") {
      refs.templateName.value = value;
      return;
    }

    if (!(key in refs)) {
      return;
    }

    const element = refs[key];

    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  });

  Object.entries(contentState).forEach(([key, value]) => {
    if (key in refs) {
      refs[key].value = value;
    }
  });

  logoDataUrl = styleState.logoDataUrl || "";
  updateLogoStatus();
  upsertCustomTemplate({
    name: styleState.name || styleState.templateName || "Benim Sablonum",
    description: styleState.description || "Disaridan yuklenen ozel gorunum.",
    ...collectStyleState(),
    logoDataUrl
  });
}

function mmToInch(value) {
  return value / 25.4;
}

function mmToPt(value) {
  return value * 2.8346456693;
}

function wrapText(pdf, text, maxWidth) {
  return pdf.splitTextToSize(String(text || ""), maxWidth);
}

function getPrintableState() {
  return {
    senderName: refs.senderName.value,
    senderAddress: refs.senderAddress.value,
    recipientName: refs.recipientName.value,
    recipientAddress: refs.recipientAddress.value,
    orderNo: refs.orderNo.value,
    reference: refs.reference.value,
    weight: formatMeasurement(refs.weightValue.value, refs.weightUnit.value),
    distance: formatMeasurement(refs.distanceValue.value, refs.distanceUnit.value),
    deliveryTime: formatDeliveryTime(refs.deliveryTime.value),
    deliveryType: [refs.deliveryType.value, refs.deliveryWindow.value].filter(Boolean).join(" / "),
    barcodeText: refs.barcodeText.value || "0000000000",
    note: refs.note.value,
    brandName: refs.brandName.value,
    labelTitle: refs.labelTitle.value,
    accentColor: refs.accentColor.value,
    backgroundColor: refs.backgroundColor.value,
    textColor: refs.textColor.value,
    borderColor: refs.borderColor.value,
    borderWidth: Number(refs.borderWidth.value),
    showQr: refs.showQr.checked,
    showNote: refs.showNote.checked,
    showOrderNo: refs.showOrderNo.checked,
    showReference: refs.showReference.checked,
    showWeight: refs.showWeight.checked,
    showDistance: refs.showDistance.checked,
    showDeliveryTime: refs.showDeliveryTime.checked,
    labelWidthMm: Number(refs.labelWidthMm.value),
    labelHeightMm: Number(refs.labelHeightMm.value),
    pageMarginTop: Number(refs.pageMarginTop.value),
    pageMarginSide: Number(refs.pageMarginSide.value),
    sheetGap: Number(refs.sheetGap.value),
    printMode: refs.printMode.value,
    sheetLayout: refs.sheetLayout.value,
    logoDataUrl
  };
}

function drawVectorLabel(pdf, state, xIn, yIn, widthIn, heightIn) {
  const x = xIn;
  const y = yIn;
  const w = widthIn;
  const h = heightIn;
  const pad = 0.12;
  const accent = hexToRgb(state.accentColor);
  const border = hexToRgb(state.borderColor);
  const text = hexToRgb(state.textColor);

  pdf.setFillColor(...hexToRgb(state.backgroundColor));
  pdf.setDrawColor(...border);
  pdf.setLineWidth(0.02);
  pdf.roundedRect(x, y, w, h, 0.05, 0.05, "FD");

  let cursorY = y + pad;

  pdf.setTextColor(...accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(state.brandName, x + pad, cursorY + 0.13);

  pdf.setFontSize(9);
  pdf.text(state.labelTitle, x + w - pad, cursorY + 0.12, { align: "right" });

  cursorY += 0.3;
  pdf.setDrawColor(...text);
  pdf.line(x + pad, cursorY, x + w - pad, cursorY);
  cursorY += 0.08;

  cursorY = drawTextBlock(pdf, "GONDEREN", state.senderName, state.senderAddress, x, cursorY, w, text);
  cursorY = drawTextBlock(pdf, "ALICI", state.recipientName, state.recipientAddress, x, cursorY, w, text, true);

  const visibleStats = getPrimaryStats(state);

  if (visibleStats.length) {
    const statWidth = (w - (pad * 2)) / visibleStats.length;
    pdf.line(x + pad, cursorY, x + w - pad, cursorY);
    visibleStats.forEach((stat, index) => {
      const sx = x + pad + (statWidth * index);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text(stat[0], sx + 0.03, cursorY + 0.14);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(stat[1] || "-"), sx + 0.03, cursorY + 0.28);
      if (index < visibleStats.length - 1) {
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
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text(stat[0], sx + 0.03, cursorY + 0.14);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(stat[1] || "-"), sx + 0.03, cursorY + 0.28);
      if (index < secondaryStats.length - 1) {
        pdf.line(sx + statWidth, cursorY, sx + statWidth, cursorY + 0.36);
      }
    });
    cursorY += 0.4;
  }

  const barcodeCanvas = buildBarcodeCanvas(state.barcodeText);
  pdf.addImage(barcodeCanvas.toDataURL("image/png"), "PNG", x + pad, cursorY + 0.05, w - (pad * 2), 0.8, undefined, "FAST");
  cursorY += 0.95;

  if (state.showQr || state.showNote) {
    pdf.line(x + pad, cursorY, x + w - pad, cursorY);
    cursorY += 0.08;
  }

  if (state.showQr) {
    const qrImage = buildQrImage(state.barcodeText);
    if (qrImage) {
      pdf.addImage(qrImage, "PNG", x + pad, cursorY, 0.72, 0.72, undefined, "FAST");
    }
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
}

function drawTextBlock(pdf, title, strongText, bodyText, x, y, width, textRgb, highlight = false) {
  const pad = 0.12;
  const left = x + pad;
  const right = x + width - pad;

  if (highlight) {
    pdf.setFillColor(...hexToRgb(hexToRgbaHex(refs.accentColor.value, 0.12)));
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
}

function buildBarcodeCanvas(value) {
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

  img.src = url;
  return new Promise(resolve => {
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
  });
}

function buildQrImage(value) {
  if (!refs.showQr.checked) {
    return null;
  }

  const temp = document.createElement("div");
  new QRCode(temp, { text: value || "0000000000", width: 180, height: 180 });
  const img = temp.querySelector("img");
  const canvas = temp.querySelector("canvas");
  return img?.src || canvas?.toDataURL("image/png") || null;
}

async function createPdfDocument() {
  const state = getPrintableState();
  const pageFormat = state.printMode === "a4" ? "a4" : [mmToInch(state.labelWidthMm), mmToInch(state.labelHeightMm)];
  const orientation = state.printMode === "a4" ? "portrait" : (state.labelWidthMm > state.labelHeightMm ? "landscape" : "portrait");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation, unit: "in", format: pageFormat, compress: false });
  const items = [collectContentState()];
  const barcodeCanvas = await buildBarcodeCanvas(state.barcodeText || "0000000000");
  const barcodeData = barcodeCanvas.toDataURL("image/png");
  const qrData = state.showQr ? buildQrImage(state.barcodeText || "0000000000") : null;

  for (let index = 0; index < items.length; index += 1) {
    if (index > 0) {
      pdf.addPage(pageFormat, orientation);
    }

    const itemState = { ...state, ...items[index] };

    if (state.printMode === "a4") {
      drawOnA4(pdf, itemState, barcodeData, qrData);
    } else {
      drawSingleThermal(pdf, itemState, barcodeData, qrData);
    }
  }

  return pdf;
}

function drawSingleThermal(pdf, state, barcodeData, qrData) {
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

function drawOnA4(pdf, state, barcodeData, qrData) {
  const pageWidth = 8.27;
  const pageHeight = 11.69;
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

      if (x + labelWidth > pageWidth || y + labelHeight > pageHeight) {
        continue;
      }

      drawVectorLabelWithAssets(pdf, state, x, y, labelWidth, labelHeight, barcodeData, qrData);
    }
  }
}

function drawVectorLabelWithAssets(pdf, state, x, y, w, h, barcodeData, qrData) {
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

  cursorY = drawTextBlock(pdf, "GONDEREN", state.senderName, state.senderAddress, x, cursorY, w, text);
  cursorY = drawTextBlock(pdf, "ALICI", state.recipientName, state.recipientAddress, x, cursorY, w, text, refs.highlightRecipient.checked);

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
}

async function downloadPdf() {
  const pdf = await createPdfDocument();
  pdf.save("shipping-label.pdf");
}

function exportZpl() {
  const zpl = `
^XA
^PW812
^LL1218
^CF0,35
^FO40,40^FD${safe(refs.brandName.value)} - ${safe(refs.labelTitle.value)}^FS
^FO40,90^FD${safe(refs.senderName.value)}^FS
^FO40,135^FD${safe(refs.senderAddress.value).replace(/\n/g, " ")}^FS
^FO40,220^GB730,3,3^FS
^CF0,45
^FO40,255^FDALICI:^FS
^CF0,55
^FO40,315^FD${safe(refs.recipientName.value)}^FS
^CF0,32
^FO40,385^FD${safe(refs.recipientAddress.value).replace(/\n/g, " ")}^FS
^FO40,490^GB730,3,3^FS
^CF0,30
^FO40,530^FDSiparis No: ${safe(refs.orderNo.value)}^FS
^FO40,575^FDReferans: ${safe(refs.reference.value)}^FS
^FO40,620^FDAgirlik: ${safe(formatMeasurement(refs.weightValue.value, refs.weightUnit.value))}^FS
^FO40,665^FDMesafe: ${safe(formatMeasurement(refs.distanceValue.value, refs.distanceUnit.value))}^FS
^FO40,710^FDTeslimat: ${safe(formatDeliveryTime(refs.deliveryTime.value))}^FS
^FO40,755^FDTip: ${safe([refs.deliveryType.value, refs.deliveryWindow.value].filter(Boolean).join(" / "))}^FS
^FO80,820^BY3
^BCN,130,Y,N,N
^FD${safe(refs.barcodeText.value)}^FS
^FO40,1010^GB730,3,3^FS
^CF0,30
^FO40,1055^FDTeslimat Notu:^FS
^FO40,1100^FD${safe(refs.note.value)}^FS
^XZ
`.trim();

  zplOutput.value = zpl;
}

function changeSize(value) {
  scale += value * 0.05;
  if (scale < 0.5) scale = 0.5;
  if (scale > 1.5) scale = 1.5;
  updatePreviewScale();
}

function updatePreviewScale() {
  const activeSlot = document.querySelector(".sheet-slot.active-slot");

  if (!activeSlot) {
    label.style.transform = `translate(-50%, -50%) scale(${scale})`;
    return;
  }

  label.style.transform = "scale(1)";

  const availableWidth = activeSlot.clientWidth - 12;
  const availableHeight = activeSlot.clientHeight - 12;
  const labelWidth = label.offsetWidth;
  const labelHeight = label.offsetHeight;

  if (!availableWidth || !availableHeight || !labelWidth || !labelHeight) {
    label.style.transform = `translate(-50%, -50%) scale(${scale})`;
    return;
  }

  const fitScale = Math.min(availableWidth / labelWidth, availableHeight / labelHeight, 1);
  const finalScale = Math.min(fitScale, fitScale * scale);
  const scaledWidth = labelWidth * finalScale;
  const scaledHeight = labelHeight * finalScale;
  const maxOffsetX = Math.max(0, (scaledWidth - availableWidth) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - availableHeight) / 2);

  previewOffsetX = clamp(previewOffsetX, -maxOffsetX, maxOffsetX);
  previewOffsetY = clamp(previewOffsetY, -maxOffsetY, maxOffsetY);
  label.style.transform = `translate(-50%, -50%) translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${finalScale})`;
}

function startLabelDrag(event) {
  if (event.button !== 0) {
    return;
  }

  const activeSlot = document.querySelector(".sheet-slot.active-slot");
  const clickedInsideLabel = event.target.closest("#label");

  if (!activeSlot || !clickedInsideLabel) {
    return;
  }

  isDraggingLabel = true;
  dragPointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragOriginX = previewOffsetX;
  dragOriginY = previewOffsetY;
  label.classList.add("dragging");
  if (typeof activeSlot.setPointerCapture === "function") {
    activeSlot.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
}

function handleLabelDrag(event) {
  if (!isDraggingLabel || event.pointerId !== dragPointerId) {
    return;
  }

  previewOffsetX = dragOriginX + (event.clientX - dragStartX);
  previewOffsetY = dragOriginY + (event.clientY - dragStartY);
  updatePreviewScale();
}

function endLabelDrag(event) {
  if (!isDraggingLabel || (event.pointerId !== undefined && event.pointerId !== dragPointerId)) {
    return;
  }

  const activeSlot = document.querySelector(".sheet-slot.active-slot");
  isDraggingLabel = false;
  dragPointerId = null;
  label.classList.remove("dragging");
  if (activeSlot && event.pointerId !== undefined && typeof activeSlot.releasePointerCapture === "function") {
    try {
      activeSlot.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignore release errors if capture was not active.
    }
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

loadTemplateLibrary();
renderTemplateCards();
bindInputs();
applyTemplate(activeTemplate);
focusScannerInput();
window.addEventListener("resize", () => {
  updateSheetPageFrame();
  updatePreviewScale();
});

window.downloadPdf = downloadPdf;
window.exportZpl = exportZpl;
window.changeSize = changeSize;
