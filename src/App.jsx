import { useEffect, useRef, useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { AuthStatusScreen } from "./components/AuthStatusScreen";
import { BrandSection } from "./components/BrandSection";
import { ContentSection } from "./components/ContentSection";
import { ExportSection } from "./components/ExportSection";
import { HeaderControls } from "./components/HeaderControls";
import { LayoutPaletteSection } from "./components/LayoutPaletteSection";
import { PreviewPane } from "./components/PreviewPane";
import { PrintSettingsSection } from "./components/PrintSettingsSection";
import { StartupOverlay } from "./components/StartupOverlay";
import { TemplateSection } from "./components/TemplateSection";
import { getTranslator } from "./constants/i18n";
import { normalizeLayoutItems } from "./constants/layoutItems";
import { blankTemplate, buildInitialForm, builtInTemplateKeys, getLocalizedBuiltInTemplate } from "./constants/templates";
import { getGroupByKey, getPresetByKey } from "./constants/sizePresets";
import { useCodeAssets } from "./hooks/useCodeAssets";
import { usePreviewTransform } from "./hooks/usePreviewTransform";
import { useSheetFrame } from "./hooks/useSheetFrame";
import {
  hydrateOAuthSessionFromQuery,
  registerWithEmail,
  signInWithEmail,
  signOut,
  startProviderSignIn,
  tryRestoreSession
} from "./utils/authClient";
import { normalizeCustomFields, resolveCustomFields } from "./utils/customFields";
import { parseBatchText, removeImportedCustomFields } from "./utils/batchImport";
import { formatDeliveryTime, formatMeasurement } from "./utils/formatters";
import { clamp, safe, slugify } from "./utils/helpers";
import { createBatchPdfDocument, createPdfDocument } from "./utils/pdfExport";
import { isBuiltInTemplate, loadTemplates, persistCustomTemplates } from "./utils/templateStorage";

const FIXED_PRINT_MODE = "thermal";
const FIXED_SHEET_LAYOUT = "single";
const HISTORY_DEBOUNCE_MS = 280;

function cloneSnapshot(value) {
  return JSON.parse(JSON.stringify(value));
}

function collectContentState(form) {
  return {
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
    note: form.note,
    customFields: normalizeCustomFields(form.customFields)
  };
}

function mergeBatchRecordIntoForm(baseForm, record) {
  if (!record) {
    return baseForm;
  }

  return {
    ...baseForm,
    ...record.fields,
    customFields: [
      ...removeImportedCustomFields(normalizeCustomFields(baseForm.customFields)),
      ...normalizeCustomFields(record.customFields)
    ]
  };
}

function buildBatchPrintableState(baseForm, record) {
  return buildMergedForm(mergeBatchRecordIntoForm(baseForm, record)).printableState;
}

function buildCustomTemplatePayload(form) {
  return {
    name: form.templateName.trim() || "Benim Şablonum",
    description: "Kaydedilen özel görünüm.",
    brandName: form.brandName,
    labelTitle: form.labelTitle,
    accentColor: form.accentColor,
    backgroundColor: form.backgroundColor,
    textColor: form.textColor,
    borderColor: form.borderColor,
    borderWidth: Number(form.borderWidth),
    fontFamily: form.fontFamily,
    brandFontSize: Number(form.brandFontSize),
    titleFontSize: Number(form.titleFontSize),
    headingFontSize: Number(form.headingFontSize),
    bodyFontSize: Number(form.bodyFontSize),
    customFields: normalizeCustomFields(form.customFields),
    density: form.density,
    showQr: form.showQr,
    showNote: form.showNote,
    highlightRecipient: form.highlightRecipient,
    showSender: form.showSender,
    showSenderAddress: form.showSenderAddress,
    showRecipient: form.showRecipient,
    showRecipientAddress: form.showRecipientAddress,
    showOrderNo: form.showOrderNo,
    showReference: form.showReference,
    showWeight: form.showWeight,
    showDistance: form.showDistance,
    showDeliveryTime: form.showDeliveryTime,
    showDeliveryType: form.showDeliveryType,
    showBarcode: form.showBarcode,
    showBarcodeValue: form.showBarcodeValue,
    showRulers: form.showRulers,
    showCenterGuides: form.showCenterGuides,
    showGridOverlay: form.showGridOverlay,
    gridStepMm: Number(form.gridStepMm),
    uiLanguage: form.uiLanguage,
    sizeCategory: form.sizeCategory,
    sizePreset: form.sizePreset,
    labelWidthMm: Number(form.labelWidthMm),
    labelHeightMm: Number(form.labelHeightMm),
    pageMarginTop: Number(form.pageMarginTop),
    pageMarginSide: Number(form.pageMarginSide),
    sheetGap: Number(form.sheetGap),
    layoutItems: normalizeLayoutItems(form.layoutItems),
    logoDataUrl: form.logoDataUrl || ""
  };
}

function saveTemplateFile(payload) {
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

function buildMergedForm(form) {
  const weightText = formatMeasurement(form.weightValue, form.weightUnit);
  const distanceText = formatMeasurement(form.distanceValue, form.distanceUnit);
  const deliveryTimeText = formatDeliveryTime(form.deliveryTime, form.uiLanguage);
  const deliveryTypeText = [form.deliveryType, form.deliveryWindow].filter(Boolean).join(" / ");
  const normalizedLayoutItems = normalizeLayoutItems(form.layoutItems);
  const resolvedCustomFields = resolveCustomFields(form.customFields, form, {
    weightText,
    distanceText,
    deliveryTimeText,
    deliveryTypeText
  });
  const visiblePrimaryCount = [form.showOrderNo, form.showReference, form.showWeight].filter(Boolean).length;
  const visibleSecondaryCount = [form.showDistance, form.showDeliveryTime, form.showDeliveryType].filter(Boolean).length;
  const visibleCustomFieldCount = resolvedCustomFields.filter(field => field.visible !== false && (field.label || field.value)).length;
  const visibleFieldCount = [
    form.showSender,
    form.showSenderAddress,
    form.showRecipient,
    form.showRecipientAddress,
    form.showOrderNo,
    form.showReference,
    form.showWeight,
    form.showDistance,
    form.showDeliveryTime,
    form.showDeliveryType,
    form.showBarcode,
    form.showBarcodeValue,
    form.showQr,
    form.showNote
  ].filter(Boolean).length + visibleCustomFieldCount;
  const visibleBlockCount = [
    normalizedLayoutItems.brand.visible !== false,
    normalizedLayoutItems.title.visible !== false,
    form.showSender && normalizedLayoutItems.sender.visible !== false,
    form.showRecipient && normalizedLayoutItems.recipient.visible !== false,
    visiblePrimaryCount > 0 && normalizedLayoutItems.primary.visible !== false,
    visibleSecondaryCount > 0 && normalizedLayoutItems.secondary.visible !== false,
    visibleCustomFieldCount > 0 && normalizedLayoutItems.custom.visible !== false,
    form.showBarcode && normalizedLayoutItems.barcode.visible !== false,
    (form.showQr || form.showNote) && normalizedLayoutItems.footer.visible !== false
  ].filter(Boolean).length;

  return {
    printableState: {
      ...form,
      printMode: FIXED_PRINT_MODE,
      sheetLayout: FIXED_SHEET_LAYOUT,
      weight: weightText,
      distance: distanceText,
      deliveryTime: deliveryTimeText,
      deliveryType: deliveryTypeText,
      barcodeText: form.barcodeText || "0000000000",
      uiLanguage: form.uiLanguage,
      customFields: resolvedCustomFields,
      layoutItems: normalizedLayoutItems
    },
    stats: {
      weightText,
      distanceText,
      deliveryTimeText,
      deliveryTypeText,
      customFields: resolvedCustomFields,
      visibleFieldCount,
      visibleBlockCount,
      visiblePrimaryCount,
      visibleSecondaryCount
    }
  };
}

function getStoredLanguage() {
  if (typeof window === "undefined") {
    return "tr";
  }

  return window.localStorage.getItem("labelit-ui-language") || "tr";
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem("labelit-ui-theme") || "dark";
}

function getCurrentRoute() {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname || "/";
}

function App() {
  const [activePanelTab, setActivePanelTab] = useState("setup");
  const [templates, setTemplates] = useState(loadTemplates);
  const [activeTemplate, setActiveTemplate] = useState("shipping");
  const [form, setForm] = useState(() => ({
    ...buildInitialForm(getStoredLanguage()),
    uiLanguage: getStoredLanguage()
  }));
  const [showStartupOverlay, setShowStartupOverlay] = useState(true);
  const [zplOutput, setZplOutput] = useState("");
  const [batchRecords, setBatchRecords] = useState([]);
  const [activeBatchRecordId, setActiveBatchRecordId] = useState("");
  const [batchImportMessage, setBatchImportMessage] = useState("");
  const [scale, setScale] = useState(1);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState(null);
  const [activeInspectorTarget, setActiveInspectorTarget] = useState(null);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [theme, setTheme] = useState(getStoredTheme);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [route, setRoute] = useState(getCurrentRoute);
  const barcodeRef = useRef(null);
  const labelRef = useRef(null);
  const activeSlotRef = useRef(null);
  const sheetPreviewRef = useRef(null);
  const logoInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const panelRef = useRef(null);
  const formRef = useRef(null);
  const historyRef = useRef({ past: [], future: [] });
  const historyBaselineRef = useRef(null);
  const historyTimerRef = useRef(null);
  const suppressHistoryRef = useRef(false);

  const t = getTranslator(form.uiLanguage || "tr");
  const { printableState, stats } = buildMergedForm(form);
  const slotCount = 1;
  const previewModeTitle = t("thermalPreviewTitle");
  const previewModeCopy = t("thermalPreviewCopy", { width: Number(form.labelWidthMm).toFixed(1), height: Number(form.labelHeightMm).toFixed(1) });
  const logoStatus = form.logoDataUrl ? t("logoUploaded") : t("textLogoActive");
  const hasCustomTemplates = Object.keys(templates).some(key => !isBuiltInTemplate(key));
  const customTemplateEntries = Object.entries(templates).filter(([key]) => !isBuiltInTemplate(key));
  const builtInTemplateEntries = builtInTemplateKeys
    .map(key => [key, getLocalizedBuiltInTemplate(key, form.uiLanguage)])
    .filter(([, template]) => Boolean(template));
  const localizedActiveBuiltInTemplate = isBuiltInTemplate(activeTemplate)
    ? getLocalizedBuiltInTemplate(activeTemplate, form.uiLanguage)
    : null;
  const displayTemplateName = localizedActiveBuiltInTemplate?.name || form.templateName || "Shipping Label";
  const workflowTabs = [
    { key: "setup", label: t("workflowSetup"), description: t("workflowSetupCopy") },
    { key: "content", label: t("workflowContent"), description: t("workflowContentCopy") },
    { key: "style", label: t("workflowStyle"), description: t("workflowStyleCopy") },
    { key: "export", label: t("workflowExport"), description: t("workflowExportCopy") }
  ];
  const activeWorkflowTab = workflowTabs.find(tab => tab.key === activePanelTab) || workflowTabs[0];
  const activeBatchRecord = batchRecords.find(record => record.id === activeBatchRecordId) || null;
  const activeBatchIndex = activeBatchRecord ? batchRecords.findIndex(record => record.id === activeBatchRecord.id) : -1;
  const normalizedLayoutItems = normalizeLayoutItems(form.layoutItems);
  const layoutPaletteItems = Object.keys(normalizedLayoutItems).map(key => ({
    key,
    visible: normalizedLayoutItems[key].visible !== false
  }));
  const productionSummary = [
    {
      key: "size",
      label: t("summarySize"),
      value: `${Number(form.labelWidthMm).toFixed(0)} x ${Number(form.labelHeightMm).toFixed(0)} mm`
    },
    {
      key: "content",
      label: t("summaryFields"),
      value: `${stats.visibleBlockCount} ${t("summaryFieldsValue")}`
    },
    {
      key: "codes",
      label: t("summaryCodes"),
      value: [form.showBarcode ? "Barcode" : null, form.showQr ? "QR" : null].filter(Boolean).join(" + ") || t("summaryCodesOff")
    },
    {
      key: "batch",
      label: t("summaryBatch"),
      value: batchRecords.length
        ? t("summaryBatchValue", { current: activeBatchIndex + 1, total: batchRecords.length })
        : t("summaryBatchEmpty")
    }
  ];
  const inspectorTabMap = {
    brand: "style",
    title: "style",
    sender: "content",
    recipient: "content",
    primary: "content",
    secondary: "content",
    barcode: "content",
    footer: "content",
    custom: "content"
  };

  const previewTransform = usePreviewTransform({
    activeSlotRef,
    labelRef,
    dependencies: [
      form.labelWidthMm,
      form.labelHeightMm,
      form.pageMarginTop,
      form.pageMarginSide,
      form.sheetGap,
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
      JSON.stringify(form.customFields || [])
    ],
    scale,
    previewOffset,
    setPreviewOffset
  });

  const { qrDataUrl } = useCodeAssets({
    barcodeRef,
    barcodeText: form.barcodeText,
    density: form.density,
    textColor: form.textColor,
    showQr: form.showQr,
    showBarcodeValue: form.showBarcodeValue
  });

  const sheetPageStyle = useSheetFrame({
    sheetPreviewRef
  });

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    persistCustomTemplates(templates);
  }, [templates]);

  useEffect(() => {
    window.localStorage.setItem("labelit-ui-language", form.uiLanguage || "tr");
  }, [form.uiLanguage]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("labelit-ui-theme", theme);
  }, [theme]);

  useEffect(() => () => {
    if (historyTimerRef.current) {
      window.clearTimeout(historyTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isBuiltInTemplate(activeTemplate)) {
      return;
    }

    const localizedTemplate = getLocalizedBuiltInTemplate(activeTemplate, form.uiLanguage);
    if (!localizedTemplate) {
      return;
    }

    applyFormChange(current => ({
      ...current,
      templateName: localizedTemplate.name,
      labelTitle: localizedTemplate.labelTitle
    }), { trackHistory: false });
  }, [activeTemplate, form.uiLanguage]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        if (!cancelled) {
          setRoute(getCurrentRoute());
        }

        if (getCurrentRoute() === "/auth/callback" || getCurrentRoute() === "/auth/error") {
          if (!cancelled) {
            setAuthReady(true);
          }
          return;
        }

        const result = await tryRestoreSession();
        if (!cancelled) {
          setSession(result.ok ? result.session : null);
          setAuthError(result.ok ? "" : result.message || "");
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getCurrentRoute());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (showStartupOverlay) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (panelRef.current) {
        panelRef.current.scrollTop = 0;
      }
    });
  }, [showStartupOverlay]);

  const syncHistoryState = () => {
    setHistoryState({
      canUndo: historyRef.current.past.length > 0 || Boolean(historyBaselineRef.current),
      canRedo: historyRef.current.future.length > 0
    });
  };

  const commitPendingHistory = () => {
    if (!historyBaselineRef.current) {
      return;
    }

    historyRef.current.past.push(historyBaselineRef.current);
    historyRef.current.future = [];
    historyBaselineRef.current = null;
    syncHistoryState();
  };

  const scheduleHistory = previousForm => {
    if (suppressHistoryRef.current) {
      return;
    }

    if (!historyBaselineRef.current) {
      historyBaselineRef.current = cloneSnapshot(previousForm);
    }

    if (historyTimerRef.current) {
      window.clearTimeout(historyTimerRef.current);
    }

    historyTimerRef.current = window.setTimeout(() => {
      commitPendingHistory();
      historyTimerRef.current = null;
    }, HISTORY_DEBOUNCE_MS);

    syncHistoryState();
  };

  const applyFormChange = (updater, { trackHistory = true } = {}) => {
    setForm(current => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (next === current) {
        return current;
      }

      if (trackHistory) {
        scheduleHistory(current);
      }

      return next;
    });
  };

  const updateField = (key, value) => {
    applyFormChange(current => {
      const next = {
        ...current,
        [key]: value,
        printMode: FIXED_PRINT_MODE,
        sheetLayout: FIXED_SHEET_LAYOUT
      };

      if (key === "sizePreset") {
        const preset = getPresetByKey(next.sizeCategory, value);
        if (preset && preset.width && preset.height) {
          next.labelWidthMm = preset.width;
          next.labelHeightMm = preset.height;
        }
      }

      if (key === "sizeCategory") {
        const group = getGroupByKey(value);
        const firstPreset = group.presets[0];
        next.sizePreset = firstPreset.key;
        if (firstPreset.width && firstPreset.height) {
          next.labelWidthMm = firstPreset.width;
          next.labelHeightMm = firstPreset.height;
        }
      }

      if (["labelWidthMm", "labelHeightMm"].includes(key)) {
        next.sizeCategory = "custom";
        next.sizePreset = "custom";
      }

      if (key === "templateName" && current.templateName !== value && activeTemplate && templates[activeTemplate] && !isBuiltInTemplate(activeTemplate)) {
        setTemplates(existing => ({
          ...existing,
          [activeTemplate]: {
            ...existing[activeTemplate],
            name: value.trim() || "Benim Şablonum"
          }
        }));
      }

      if (["sizePreset", "labelWidthMm", "labelHeightMm", "pageMarginTop", "pageMarginSide", "sheetGap"].includes(key)) {
        setPreviewOffset({ x: 0, y: 0 });
      }

      return next;
    });
  };

  const restoreHistorySnapshot = snapshot => {
    suppressHistoryRef.current = true;
    setForm(cloneSnapshot(snapshot));
    window.setTimeout(() => {
      suppressHistoryRef.current = false;
    }, 0);
  };

  const handleUndo = () => {
    if (historyTimerRef.current) {
      window.clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    commitPendingHistory();

    const previous = historyRef.current.past.pop();
    if (!previous) {
      syncHistoryState();
      return;
    }

    historyRef.current.future.push(cloneSnapshot(formRef.current));
    restoreHistorySnapshot(previous);
    syncHistoryState();
  };

  const handleRedo = () => {
    if (historyTimerRef.current) {
      window.clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }

    const next = historyRef.current.future.pop();
    if (!next) {
      syncHistoryState();
      return;
    }

    historyRef.current.past.push(cloneSnapshot(formRef.current));
    restoreHistorySnapshot(next);
    syncHistoryState();
  };

  useEffect(() => {
    const handleKeyDown = event => {
      const metaOrCtrl = event.metaKey || event.ctrlKey;
      if (!metaOrCtrl) {
        return;
      }

      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y") {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const navigateTo = (path, replace = false) => {
    if (typeof window === "undefined") {
      return;
    }

    window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    setRoute(path);
  };

  const handleSignIn = async payload => {
    setAuthLoading(true);
    try {
      const result = await signInWithEmail(payload);
      if (result.ok && result.session) {
        setSession(result.session);
        setAuthError("");
        navigateTo("/", true);
      }

      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async payload => {
    setAuthLoading(true);
    try {
      const result = await registerWithEmail(payload);
      if (result.ok && result.session) {
        setSession(result.session);
        setAuthError("");
        navigateTo("/", true);
      }

      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSession(null);
    setAuthError("");
    setShowStartupOverlay(true);
    navigateTo("/", true);
  };

  const handleProviderSignIn = provider => startProviderSignIn(provider);

  const applyTemplate = key => {
    const template = isBuiltInTemplate(key)
      ? getLocalizedBuiltInTemplate(key, form.uiLanguage)
      : templates[key];
    if (!template) {
      return;
    }

    setActiveTemplate(key);
    setScale(1);
    setPreviewOffset({ x: 0, y: 0 });
    applyFormChange(current => ({
      ...current,
      templateName: template.name || "Benim Şablonum",
      ...template,
      printMode: FIXED_PRINT_MODE,
      sheetLayout: FIXED_SHEET_LAYOUT
    }));
  };

  const applyBlankTemplate = () => {
    setActiveTemplate("blank");
    setScale(1);
    setPreviewOffset({ x: 0, y: 0 });
    applyFormChange({
      ...buildInitialForm(form.uiLanguage),
      ...getLocalizedBuiltInTemplate("blank", form.uiLanguage),
      templateName: getLocalizedBuiltInTemplate("blank", form.uiLanguage)?.name || t("blankLabel"),
      uiLanguage: form.uiLanguage,
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
      note: "",
      customFields: [],
      printMode: FIXED_PRINT_MODE,
      sheetLayout: FIXED_SHEET_LAYOUT,
      layoutItems: normalizeLayoutItems(blankTemplate.layoutItems)
    });
  };

  const addCustomField = () => {
    applyFormChange(current => ({
      ...current,
      customFields: [
        ...(current.customFields || []),
        {
          id: `custom-field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: "",
          value: "",
          visible: true,
          sourceType: "manual"
        }
      ]
    }));
  };

  const updateCustomField = (fieldId, patch) => {
    applyFormChange(current => ({
      ...current,
      customFields: normalizeCustomFields(current.customFields).map(field => (
        field.id === fieldId ? { ...field, ...patch } : field
      ))
    }));
  };

  const removeCustomField = fieldId => {
    applyFormChange(current => ({
      ...current,
      customFields: normalizeCustomFields(current.customFields).filter(field => field.id !== fieldId)
    }));
  };

  const applyBatchRecord = record => {
    if (!record) {
      return;
    }

    setActiveBatchRecordId(record.id);
    applyFormChange(current => mergeBatchRecordIntoForm(current, record), { trackHistory: false });
  };

  const handleBatchFileChange = async event => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const records = parseBatchText(text, file.name);

      if (!records.length) {
        setBatchImportMessage(t("batchImportEmpty"));
        return;
      }

      setBatchRecords(records);
      setBatchImportMessage(t("batchImportSuccess", { count: records.length, name: file.name }));
      applyBatchRecord(records[0]);
      setActivePanelTab("content");
      setShowStartupOverlay(false);
    } catch {
      setBatchImportMessage(t("batchImportError"));
    } finally {
      event.target.value = "";
    }
  };

  const clearBatchRecords = () => {
    setBatchRecords([]);
    setActiveBatchRecordId("");
    setBatchImportMessage("");
    applyFormChange(current => ({
      ...current,
      customFields: removeImportedCustomFields(normalizeCustomFields(current.customFields))
    }), { trackHistory: false });
  };

  const jumpToBatchRecord = direction => {
    if (!batchRecords.length) {
      return;
    }

    const currentIndex = Math.max(activeBatchIndex, 0);
    const nextIndex = Math.min(batchRecords.length - 1, Math.max(0, currentIndex + direction));
    applyBatchRecord(batchRecords[nextIndex]);
  };

  const downloadBatchTemplate = () => {
    const csvTemplate = [
      "recipientName,recipientAddress,orderNo,reference,barcode,note",
      '"Ayse Yilmaz","Maslak Mah. Buyukdere Cad. No:12 Istanbul",ORD-1001,REF-9001,869000000001,"Kapi 3, aksam teslim"',
      '"Mehmet Kara","Ataturk Bulvari No:44 Ankara",ORD-1002,REF-9002,869000000002,"Guvenlige birak"'
    ].join("\n");
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "label-batch-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const startWithTemplate = key => {
    applyTemplate(key);
    setShowStartupOverlay(false);
  };

  const startWithBlankLabel = () => {
    applyBlankTemplate();
    setShowStartupOverlay(false);
  };

  const upsertCustomTemplate = template => {
    const key = isBuiltInTemplate(activeTemplate) ? "custom" : activeTemplate;
    setTemplates(current => ({ ...current, [key]: template }));
    setActiveTemplate(key);
  };

  const saveCurrentTemplateToFile = () => {
    const template = buildCustomTemplatePayload(form);
    upsertCustomTemplate(template);
    saveTemplateFile({
      version: 2,
      savedAt: new Date().toISOString(),
      activeTemplate: "custom",
      template,
      content: collectContentState(form)
    });
  };

  const saveCurrentTemplateToLibrary = () => {
    const template = buildCustomTemplatePayload(form);
    const key = slugify(template.name);
    setTemplates(current => ({ ...current, [key]: template }));
    setActiveTemplate(key);
  };

  const clearTemplateLibrary = () => {
    const customKeys = Object.keys(templates).filter(key => !isBuiltInTemplate(key));
    if (!customKeys.length || !window.confirm("Kütüphane içindeki tüm özel şablonlar silinsin mi?")) {
      return;
    }

    const nextTemplates = { ...templates };
    customKeys.forEach(key => delete nextTemplates[key]);
    setTemplates(nextTemplates);
    applyTemplate("shipping");
  };

  const deleteCurrentTemplate = () => {
    if (isBuiltInTemplate(activeTemplate)) {
      window.alert("Hazır şablonlar silinemez.");
      return;
    }

    const template = templates[activeTemplate];
    if (!template) {
      return;
    }

    if (!window.confirm(`"${template.name}" şablonunu silmek istiyor musun?`)) {
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

  const applyLoadedSettings = data => {
    const styleState = data.template || data.style || {};
    const contentState = data.content || {};

    if (!Object.keys(styleState).length && !Object.keys(contentState).length) {
      window.alert("JSON içinde yüklenecek ayar bulunamadı.");
      return;
    }

    const merged = {
      ...form,
      ...styleState,
      ...contentState,
      templateName: styleState.name || styleState.templateName || form.templateName,
      logoDataUrl: styleState.logoDataUrl || "",
      uiLanguage: styleState.uiLanguage || form.uiLanguage,
      customFields: normalizeCustomFields(contentState.customFields || styleState.customFields || form.customFields),
      layoutItems: normalizeLayoutItems(styleState.layoutItems || form.layoutItems),
      printMode: FIXED_PRINT_MODE,
      sheetLayout: FIXED_SHEET_LAYOUT
    };

    applyFormChange(merged);
    upsertCustomTemplate(buildCustomTemplatePayload(merged));
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
      window.alert("Seçilen JSON dosyası okunamadı.");
    } finally {
      event.target.value = "";
    }
  };

  const downloadPdf = async () => {
    const pdf = await createPdfDocument(printableState);
    pdf.save("shipping-label.pdf");
  };

  const downloadBatchPdf = async () => {
    if (!batchRecords.length) {
      return;
    }

    const pdf = await createBatchPdfDocument(batchRecords.map(record => buildBatchPrintableState(form, record)));
    pdf?.save("shipping-label-batch.pdf");
  };

  const exportZpl = () => {
    const visibleCustomFields = stats.customFields
      .filter(field => field.visible !== false && (field.label || field.value))
      .map((field, index) => `^FO40,${800 + (index * 45)}^FD${safe(field.label || t("customFieldLabel"))}: ${safe(field.value)}^FS`)
      .join("\n");
    const visibleCustomFieldCount = stats.customFields.filter(field => field.visible !== false && (field.label || field.value)).length;
    const barcodeY = 820 + (visibleCustomFieldCount * 45);
    const noteDividerY = 1010 + (visibleCustomFieldCount * 45);
    const noteTitleY = 1055 + (visibleCustomFieldCount * 45);
    const noteBodyY = 1100 + (visibleCustomFieldCount * 45);

    setZplOutput(`
^XA
^PW812
^LL1218
^CF0,35
^FO40,40^FD${safe(form.brandName)} - ${safe(form.labelTitle)}^FS
${form.showSender ? `^FO40,90^FD${safe(form.senderName)}^FS` : ""}
${form.showSender && form.showSenderAddress ? `^FO40,135^FD${safe(form.senderAddress).replace(/\n/g, " ")}^FS` : ""}
${form.showSender || form.showRecipient ? "^FO40,220^GB730,3,3^FS" : ""}
${form.showRecipient ? `^CF0,45\n^FO40,255^FD${safe(t("labelRecipient"))}:^FS` : ""}
${form.showRecipient ? `^CF0,55\n^FO40,315^FD${safe(form.recipientName)}^FS` : ""}
${form.showRecipient && form.showRecipientAddress ? `^CF0,32\n^FO40,385^FD${safe(form.recipientAddress).replace(/\n/g, " ")}^FS` : ""}
${form.showOrderNo || form.showReference || form.showWeight || form.showDistance || form.showDeliveryTime || form.showDeliveryType ? "^FO40,490^GB730,3,3^FS\n^CF0,30" : ""}
${form.showOrderNo ? `^FO40,530^FD${safe(t("orderNo"))}: ${safe(form.orderNo)}^FS` : ""}
${form.showReference ? `^FO40,575^FD${safe(t("reference"))}: ${safe(form.reference)}^FS` : ""}
${form.showWeight ? `^FO40,620^FD${safe(t("weight"))}: ${safe(stats.weightText)}^FS` : ""}
${form.showDistance ? `^FO40,665^FD${safe(t("distance"))}: ${safe(stats.distanceText)}^FS` : ""}
${form.showDeliveryTime ? `^FO40,710^FD${safe(t("deliveryTime"))}: ${safe(stats.deliveryTimeText)}^FS` : ""}
${form.showDeliveryType ? `^FO40,755^FD${safe(t("deliveryType"))}: ${safe(stats.deliveryTypeText)}^FS` : ""}
${visibleCustomFields}
${form.showBarcode ? `^FO80,${barcodeY}^BY3\n^BCN,130,Y,N,N` : ""}
${form.showBarcode ? `^FD${safe(form.barcodeText)}^FS` : ""}
${form.showNote ? `^FO40,${noteDividerY}^GB730,3,3^FS\n^CF0,30\n^FO40,${noteTitleY}^FD${safe(t("note"))}:^FS` : ""}
${form.showNote ? `^FO40,${noteBodyY}^FD${safe(form.note)}^FS` : ""}
^XZ
`.trim());
  };

  const changeSize = value => {
    const zoomFactor = 1.15;
    setScale(current => {
      const nextScale = value > 0 ? current * zoomFactor : current / zoomFactor;
      return Math.min(5, Math.max(0.35, nextScale));
    });
  };

  const setPreviewScale = value => {
    setPreviewOffset({ x: 0, y: 0 });
    setScale(Math.min(5, Math.max(0.35, value)));
  };

  const resetPreviewView = () => {
    setScale(1);
    setPreviewOffset({ x: 0, y: 0 });
  };

  const handleWheelZoom = deltaY => {
    changeSize(deltaY < 0 ? 1 : -1);
  };

  const updateLayoutItem = (itemKey, patch) => {
    applyFormChange(current => ({
      ...current,
      layoutItems: {
        ...normalizeLayoutItems(current.layoutItems),
        [itemKey]: {
          ...normalizeLayoutItems(current.layoutItems)[itemKey],
          ...patch
        }
      }
    }));
  };

  const handleLayoutItemDrop = (itemKey, dropPoint) => {
    const currentFrame = normalizedLayoutItems[itemKey];
    if (!currentFrame) {
      return;
    }

    const nextX = clamp(dropPoint.x - (currentFrame.w / 2), 0, 100 - currentFrame.w);
    const nextY = clamp(dropPoint.y - (currentFrame.h / 2), 0, 100 - currentFrame.h);

    applyFormChange(current => {
      const next = {
        ...current,
        layoutItems: {
          ...normalizeLayoutItems(current.layoutItems),
          [itemKey]: {
            ...normalizeLayoutItems(current.layoutItems)[itemKey],
            visible: true,
            x: nextX,
            y: nextY
          }
        }
      };

      if (itemKey === "sender") {
        next.showSender = true;
      }

      if (itemKey === "recipient") {
        next.showRecipient = true;
      }

      if (itemKey === "barcode") {
        next.showBarcode = true;
      }

      if (itemKey === "footer" && !next.showQr && !next.showNote) {
        next.showNote = true;
      }

      if (itemKey === "primary" && !next.showOrderNo && !next.showReference && !next.showWeight) {
        next.showOrderNo = true;
      }

      if (itemKey === "secondary" && !next.showDistance && !next.showDeliveryTime && !next.showDeliveryType) {
        next.showDistance = true;
      }

      return next;
    });
  };

  const handleInspectorTargetChange = target => {
    setActiveInspectorTarget(target);
    if (target && inspectorTabMap[target]) {
      setActivePanelTab(inspectorTabMap[target]);
    }
  };

  const clearInspectorTarget = () => {
    setActiveInspectorTarget(null);
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

  useEffect(() => {
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

    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [dragState, previewOffset.x, previewOffset.y]);

  useEffect(() => {
    let cancelled = false;

    const handleOAuthCallback = async () => {
      if (route !== "/auth/callback") {
        return;
      }

      setAuthLoading(true);
      setAuthError("");

      const result = await hydrateOAuthSessionFromQuery(window.location.search);
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setSession(result.session);
        setShowStartupOverlay(true);
        navigateTo("/", true);
      } else {
        setSession(null);
        setAuthError(result.message || t("authCallbackFailed"));
        navigateTo(`/auth/error?error=${encodeURIComponent(result.message || t("authCallbackFailed"))}`, true);
      }

      setAuthLoading(false);
    };

    handleOAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [route, t]);

  if (route === "/auth/callback") {
    return (
      <AuthStatusScreen
        language={form.uiLanguage}
        theme={theme}
        title={t("authCallbackTitle")}
        copy={t("authCallbackCopy")}
        onLanguageChange={value => updateField("uiLanguage", value)}
        onThemeToggle={() => setTheme(current => (current === "dark" ? "light" : "dark"))}
        t={t}
      />
    );
  }

  if (route === "/auth/error") {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const errorMessage = params.get("error") || authError || t("authDefaultError");

    return (
      <AuthStatusScreen
        language={form.uiLanguage}
        theme={theme}
        title={t("authErrorTitle")}
        copy={errorMessage}
        actionLabel={t("authErrorBack")}
        onAction={() => navigateTo("/", true)}
        onLanguageChange={value => updateField("uiLanguage", value)}
        onThemeToggle={() => setTheme(current => (current === "dark" ? "light" : "dark"))}
        t={t}
      />
    );
  }

  if (!authReady || !session) {
    return (
      <AuthScreen
        language={form.uiLanguage}
        theme={theme}
        onLanguageChange={value => updateField("uiLanguage", value)}
        onThemeToggle={() => setTheme(current => (current === "dark" ? "light" : "dark"))}
        onSubmit={handleSignIn}
        onRegister={handleRegister}
        onProviderSubmit={handleProviderSignIn}
        loading={authLoading}
        checkingSession={!authReady}
        t={t}
      />
    );
  }

  return (
    <>
      {showStartupOverlay && (
            <StartupOverlay
              onBlankStart={startWithBlankLabel}
              onTemplateStart={startWithTemplate}
              builtInTemplates={builtInTemplateEntries.filter(([key]) => key !== "blank")}
              savedTemplates={customTemplateEntries}
              language={form.uiLanguage}
              theme={theme}
              onLanguageChange={value => updateField("uiLanguage", value)}
              onThemeToggle={() => setTheme(current => (current === "dark" ? "light" : "dark"))}
              t={t}
            />
      )}

      <div className="app">
        <button type="button" className="floating-logout" onClick={handleSignOut} aria-label={t("logout")} title={t("logout")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
            <path d="M14 16l4-4-4-4" />
            <path d="M18 12H9" />
          </svg>
        </button>

        <aside ref={panelRef} className="panel">
          <div className="panel-header">
            <div className="panel-header-top">
              <div>
                <p className="eyebrow">{t("appEyebrow")}</p>
                <h1>{displayTemplateName}</h1>
              </div>
              <div className="panel-header-actions">
                <div className="session-badge" title={session.name || session.email}>
                  <span className="session-badge-label">{t("welcome")}</span>
                  <strong>{session.name || session.email}</strong>
                </div>
                <HeaderControls
                  language={form.uiLanguage}
                  theme={theme}
                  t={t}
                  onLanguageChange={value => updateField("uiLanguage", value)}
                  onThemeToggle={() => setTheme(current => (current === "dark" ? "light" : "dark"))}
                />
              </div>
            </div>
            <p className="panel-copy">{t("appDescription")}</p>
            <div className="workflow-tabs" role="tablist" aria-label={t("workflowTabs")}>
              {workflowTabs.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  className={`workflow-tab ${activePanelTab === tab.key ? "active" : ""}`}
                  aria-selected={activePanelTab === tab.key}
                  onClick={() => setActivePanelTab(tab.key)}
                >
                  <strong>{tab.label}</strong>
                  <span>{tab.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="workflow-panel">
            <div className="workflow-panel-head">
              <div>
                <p className="eyebrow">{t("currentStep")}</p>
                <h2>{activeWorkflowTab.label}</h2>
              </div>
              <div className="workflow-panel-meta">
                <p className="panel-copy compact-copy">{activeWorkflowTab.description}</p>
                <div className="history-actions">
                  <button type="button" className="ghost-button" onClick={handleUndo} disabled={!historyState.canUndo}>{t("undo")}</button>
                  <button type="button" className="ghost-button" onClick={handleRedo} disabled={!historyState.canRedo}>{t("redo")}</button>
                </div>
              </div>
            </div>

            <section className="panel-section summary-panel">
              <div className="section-head">
                <h2>{t("livePreview")}</h2>
                {activeBatchRecord ? (
                  <p className="panel-copy compact-copy">{t("activeBatchLabel", { label: activeBatchRecord.title })}</p>
                ) : null}
              </div>
              <div className="preview-summary-grid preview-summary-grid-panel">
                {productionSummary.map(item => (
                  <div key={item.key} className="preview-summary-card">
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <LayoutPaletteSection
              t={t}
              items={layoutPaletteItems}
            />

            {activePanelTab === "setup" && (
              <>
                <TemplateSection
                  t={t}
                  builtInTemplates={builtInTemplateEntries}
                  savedTemplates={customTemplateEntries}
                  activeTemplate={activeTemplate}
                  isBuiltInTemplate={isBuiltInTemplate}
                  templateName={form.templateName}
                  onTemplateNameChange={value => updateField("templateName", value)}
                  onDeleteTemplate={deleteCurrentTemplate}
                  onLoadTemplateClick={() => templateInputRef.current?.click()}
                  onSaveTemplateFile={saveCurrentTemplateToFile}
                  onSaveToLibrary={saveCurrentTemplateToLibrary}
                  onClearLibrary={clearTemplateLibrary}
                  hasCustomTemplates={hasCustomTemplates}
                  onApplyTemplate={applyTemplate}
                  templateInputRef={templateInputRef}
                  onTemplateFileChange={loadTemplateFromFile}
                />

                <PrintSettingsSection form={form} language={form.uiLanguage} t={t} onFieldChange={updateField} />
              </>
            )}

            {activePanelTab === "content" && (
              <ContentSection
                form={form}
                t={t}
                batchRecords={batchRecords}
                activeBatchRecordId={activeBatchRecordId}
                batchImportMessage={batchImportMessage}
                batchInputRef={batchInputRef}
                onFieldChange={updateField}
                onAddCustomField={addCustomField}
                onUpdateCustomField={updateCustomField}
                onRemoveCustomField={removeCustomField}
                onBatchImportClick={() => batchInputRef.current?.click()}
                onBatchFileChange={handleBatchFileChange}
                onBatchClear={clearBatchRecords}
                onBatchTemplateDownload={downloadBatchTemplate}
                onBatchRecordSelect={recordId => applyBatchRecord(batchRecords.find(record => record.id === recordId))}
                onBatchPrev={() => jumpToBatchRecord(-1)}
                onBatchNext={() => jumpToBatchRecord(1)}
                highlightTarget={activeInspectorTarget}
                onFocusTarget={handleInspectorTargetChange}
                onBlurTarget={clearInspectorTarget}
              />
            )}

            {activePanelTab === "style" && (
              <BrandSection
                form={form}
                t={t}
                logoStatus={logoStatus}
                logoInputRef={logoInputRef}
                onFieldChange={updateField}
                onLogoUpload={handleLogoUpload}
                highlightTarget={activeInspectorTarget}
                onFocusTarget={handleInspectorTargetChange}
                onBlurTarget={clearInspectorTarget}
              />
            )}

            {activePanelTab === "export" && (
              <ExportSection
                zplOutput={zplOutput}
                t={t}
                batchCount={batchRecords.length}
                onDownloadPdf={downloadPdf}
                onDownloadBatchPdf={downloadBatchPdf}
                onPrint={() => window.print()}
                onExportZpl={exportZpl}
                onZplChange={setZplOutput}
              />
            )}
          </div>
        </aside>

        <PreviewPane
          form={form}
          t={t}
          slotCount={slotCount}
          sheetPreviewRef={sheetPreviewRef}
          sheetPageStyle={sheetPageStyle}
          activeSlotRef={activeSlotRef}
          labelRef={labelRef}
          barcodeRef={barcodeRef}
          qrDataUrl={qrDataUrl}
          onStartDrag={startDrag}
          previewTransform={previewTransform}
          previewModeTitle={previewModeTitle}
          previewModeCopy={previewModeCopy}
          activeBatchLabel={activeBatchRecord?.title || ""}
          stats={stats}
          onLayoutItemChange={updateLayoutItem}
          onLayoutItemDrop={handleLayoutItemDrop}
          onFieldChange={updateField}
          onAddCustomField={addCustomField}
          onRemoveCustomField={removeCustomField}
          onWheelZoom={handleWheelZoom}
          scale={scale}
          onZoomIn={() => changeSize(1)}
          onZoomOut={() => changeSize(-1)}
          onZoomPreset={setPreviewScale}
          onResetView={resetPreviewView}
          activeInspectorTarget={activeInspectorTarget}
          onInspectTargetChange={handleInspectorTargetChange}
        />
      </div>
    </>
  );
}

export default App;
