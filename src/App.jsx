import { useEffect, useRef, useState } from "react";
import { BrandSection } from "./components/BrandSection";
import { ContentSection } from "./components/ContentSection";
import { ExportSection } from "./components/ExportSection";
import { PreviewPane } from "./components/PreviewPane";
import { PrintSettingsSection } from "./components/PrintSettingsSection";
import { StartupOverlay } from "./components/StartupOverlay";
import { TemplateSection } from "./components/TemplateSection";
import { blankTemplate, buildInitialForm, presetSizes } from "./constants/templates";
import { useCodeAssets } from "./hooks/useCodeAssets";
import { usePreviewTransform } from "./hooks/usePreviewTransform";
import { formatDeliveryTime, formatMeasurement } from "./utils/formatters";
import { clamp, safe, slugify } from "./utils/helpers";
import { createPdfDocument } from "./utils/pdfExport";
import { isBuiltInTemplate, loadTemplates, persistCustomTemplates } from "./utils/templateStorage";

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
    note: form.note
  };
}

function buildCustomTemplatePayload(form) {
  return {
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
  const deliveryTimeText = formatDeliveryTime(form.deliveryTime);
  const deliveryTypeText = [form.deliveryType, form.deliveryWindow].filter(Boolean).join(" / ");

  return {
    printableState: {
      ...form,
      weight: weightText,
      distance: distanceText,
      deliveryTime: deliveryTimeText,
      deliveryType: deliveryTypeText,
      barcodeText: form.barcodeText || "0000000000"
    },
    stats: {
      weightText,
      distanceText,
      deliveryTimeText,
      deliveryTypeText,
      visiblePrimaryCount: [form.showOrderNo, form.showReference, form.showWeight].filter(Boolean).length,
      visibleSecondaryCount: [form.showDistance, form.showDeliveryTime, form.showDeliveryTime].filter(Boolean).length
    }
  };
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
  const scannerTimerRef = useRef(null);
  const scannerValueRef = useRef("");
  const barcodeRef = useRef(null);
  const labelRef = useRef(null);
  const activeSlotRef = useRef(null);
  const logoInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const scannerInputRef = useRef(null);

  const { printableState, stats } = buildMergedForm(form);
  const layout = form.printMode === "thermal" ? "single" : form.sheetLayout;
  const slotCount = layout === "single" ? 1 : layout === "2x2" ? 4 : 6;
  const previewModeTitle = form.printMode === "thermal" ? "Termal Etiket" : "A4 Sayfa Onizlemesi";
  const previewModeCopy = form.printMode === "thermal"
    ? `${Number(form.labelWidthMm).toFixed(1)} x ${Number(form.labelHeightMm).toFixed(1)} mm termal cikti gorunumu.`
    : `A4 sayfada ${form.sheetLayout} yerlesimi, ${form.pageMarginTop} mm ust ve ${form.pageMarginSide} mm yan bosluk.`;
  const logoStatus = form.logoDataUrl ? "Logo gorseli yuklendi." : "Su an yazi logosu kullaniliyor.";
  const hasCustomTemplates = Object.keys(templates).some(key => !isBuiltInTemplate(key));

  const previewTransform = usePreviewTransform({
    activeSlotRef,
    labelRef,
    dependencies: [
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
      form.borderWidth
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
    showQr: form.showQr
  });

  useEffect(() => {
    persistCustomTemplates(templates);
  }, [templates]);

  useEffect(() => () => window.clearTimeout(scannerTimerRef.current), []);

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
    window.clearTimeout(scannerTimerRef.current);
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
      window.alert("Secilen JSON dosyasi okunamadi.");
    } finally {
      event.target.value = "";
    }
  };

  const downloadPdf = async () => {
    const pdf = await createPdfDocument(printableState);
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
^FO40,620^FDAgirlik: ${safe(stats.weightText)}^FS
^FO40,665^FDMesafe: ${safe(stats.distanceText)}^FS
^FO40,710^FDTeslimat: ${safe(stats.deliveryTimeText)}^FS
^FO40,755^FDTip: ${safe(stats.deliveryTypeText)}^FS
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

  return (
    <>
      {showStartupOverlay && (
        <StartupOverlay onBlankStart={startWithBlankLabel} onTemplateStart={startWithTemplate} />
      )}

      <div className="app">
        <aside className="panel">
          <div className="panel-header">
            <p className="eyebrow">Etiket Tasarim Studyo</p>
            <h1>Shipping Label</h1>
            <p className="panel-copy">A4 onizleme, okutucu girisi, coklu etiket listesi ve sablon kutuphanesi ile baskiya hazir etiket uret.</p>
          </div>

          <TemplateSection
            templates={templates}
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

          <PrintSettingsSection form={form} onFieldChange={updateField} />

          <BrandSection
            form={form}
            logoStatus={logoStatus}
            logoInputRef={logoInputRef}
            onFieldChange={updateField}
            onLogoUpload={handleLogoUpload}
          />

          <ContentSection
            form={form}
            scannerInput={scannerInput}
            scannerInputRef={scannerInputRef}
            onFieldChange={updateField}
            onScannerInput={onScannerInput}
            onScannerCommit={commitScannedBarcode}
            onClearBarcode={clearScannedBarcode}
          />

          <ExportSection
            zplOutput={zplOutput}
            onZoomIn={() => changeSize(1)}
            onZoomOut={() => changeSize(-1)}
            onDownloadPdf={downloadPdf}
            onPrint={() => window.print()}
            onExportZpl={exportZpl}
            onZplChange={setZplOutput}
          />
        </aside>

        <PreviewPane
          form={form}
          layout={layout}
          slotCount={slotCount}
          activeSlotRef={activeSlotRef}
          labelRef={labelRef}
          barcodeRef={barcodeRef}
          qrDataUrl={qrDataUrl}
          onStartDrag={startDrag}
          previewTransform={previewTransform}
          previewModeTitle={previewModeTitle}
          previewModeCopy={previewModeCopy}
          stats={stats}
        />
      </div>
    </>
  );
}

export default App;
