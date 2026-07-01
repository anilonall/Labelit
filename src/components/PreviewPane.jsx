import { LabelPreview } from "./LabelPreview";

export function PreviewPane({
  form,
  t,
  slotCount,
  sheetPreviewRef,
  sheetPageStyle,
  activeSlotRef,
  labelRef,
  barcodeRef,
  qrDataUrl,
  onStartDrag,
  previewTransform,
  previewModeTitle,
  previewModeCopy,
  activeBatchLabel,
  stats,
  onLayoutItemChange,
  onLayoutItemDrop,
  onFieldChange,
  onAddCustomField,
  onRemoveCustomField,
  onWheelZoom,
  scale,
  onZoomIn,
  onZoomOut,
  onZoomPreset,
  onResetView,
  activeInspectorTarget,
  onInspectTargetChange
}) {
  return (
    <main className="preview-wrap">
      <div className="preview-meta">
        <div>
          <p className="eyebrow">{t("livePreview")}</p>
          <h2>{previewModeTitle}</h2>
          {activeBatchLabel ? <p className="panel-copy compact-copy">{t("activeBatchLabel", { label: activeBatchLabel })}</p> : null}
        </div>
        <div className="preview-meta-actions">
          <p className="panel-copy compact-copy">{previewModeCopy}</p>
          <div className="preview-toolbar" aria-label={t("previewToolbar")}>
            <button type="button" className="preview-tool" onClick={onResetView}>{t("zoomFit")}</button>
            <button type="button" className="preview-tool" onClick={() => onZoomPreset?.(1)}>{t("zoom100")}</button>
            <button type="button" className="preview-tool" onClick={() => onZoomPreset?.(2)}>{t("zoom200")}</button>
            <button type="button" className="preview-tool" onClick={onZoomOut}>{t("zoomOut")}</button>
            <button type="button" className="preview-tool" onClick={onZoomIn}>{t("zoomIn")}</button>
            <span className="preview-scale-indicator">{t("zoomLevel", { value: scale.toFixed(scale >= 1 ? 1 : 2) })}</span>
          </div>
        </div>
      </div>

      <section
        ref={sheetPreviewRef}
        className="sheet-preview"
        onWheel={event => {
          event.preventDefault();
          onWheelZoom?.(event.deltaY);
        }}
      >
        <div
          className="sheet-page layout-single thermal-stage"
          style={{
            ...sheetPageStyle,
            paddingTop: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "24px",
            gap: `${Math.max(8, Number(form.sheetGap) * 1.4)}px`
          }}
        >
          <div
            ref={activeSlotRef}
            className={`sheet-slot active-slot ${slotCount < 1 ? "hidden" : ""}`}
          >
            <LabelPreview
              form={form}
              t={t}
              labelRef={labelRef}
              barcodeRef={barcodeRef}
              qrDataUrl={qrDataUrl}
              onPointerDown={onStartDrag}
              previewTransform={previewTransform}
              stats={stats}
              onLayoutItemChange={onLayoutItemChange}
              onLayoutItemDrop={onLayoutItemDrop}
              onFieldChange={onFieldChange}
              onAddCustomField={onAddCustomField}
              onRemoveCustomField={onRemoveCustomField}
              activeInspectorTarget={activeInspectorTarget}
              onInspectTargetChange={onInspectTargetChange}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
