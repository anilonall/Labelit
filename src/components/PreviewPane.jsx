import { LabelPreview } from "./LabelPreview";

export function PreviewPane({
  form,
  layout,
  slotCount,
  activeSlotRef,
  labelRef,
  barcodeRef,
  qrDataUrl,
  onStartDrag,
  previewTransform,
  previewModeTitle,
  previewModeCopy,
  stats
}) {
  return (
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
                <LabelPreview
                  form={form}
                  labelRef={labelRef}
                  barcodeRef={barcodeRef}
                  qrDataUrl={qrDataUrl}
                  onPointerDown={onStartDrag}
                  previewTransform={previewTransform}
                  stats={stats}
                />
              ) : (
                <div className="slot-placeholder">Bos hucre</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
