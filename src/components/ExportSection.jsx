import { CollapsibleGroup } from "./CollapsibleGroup";

export function ExportSection({ zplOutput, t, batchCount, onDownloadPdf, onDownloadBatchPdf, onPrint, onExportZpl, onZplChange }) {
  return (
    <section className="panel-section">
      <h2>{t("export")}</h2>
      <CollapsibleGroup title={t("export")} subtitle="PDF / ZPL" defaultOpen={false}>
        <div className="row tight-row">
          <button type="button" onClick={onDownloadPdf}>{t("vectorPdf")}</button>
          <button type="button" onClick={onPrint}>{t("print")}</button>
        </div>
        <button type="button" className="ghost-button export-batch-button" onClick={onDownloadBatchPdf} disabled={!batchCount}>
          {t("batchExportPdf", { count: batchCount || 0 })}
        </button>
        <button type="button" onClick={onExportZpl}>{t("createZpl")}</button>
        <textarea value={zplOutput} onChange={event => onZplChange(event.target.value)} placeholder={t("zplPlaceholder")} />
      </CollapsibleGroup>
    </section>
  );
}
