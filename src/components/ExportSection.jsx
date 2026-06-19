export function ExportSection({ zplOutput, t, onDownloadPdf, onPrint, onExportZpl, onZplChange }) {
  return (
    <section className="panel-section">
      <h2>{t("export")}</h2>
      <div className="row tight-row">
        <button type="button" onClick={onDownloadPdf}>{t("vectorPdf")}</button>
        <button type="button" onClick={onPrint}>{t("print")}</button>
      </div>
      <button type="button" onClick={onExportZpl}>{t("createZpl")}</button>
      <textarea value={zplOutput} onChange={event => onZplChange(event.target.value)} placeholder={t("zplPlaceholder")} />
    </section>
  );
}
