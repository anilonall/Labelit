export function ExportSection({ zplOutput, onDownloadPdf, onPrint, onExportZpl, onZplChange }) {
  return (
    <section className="panel-section">
      <h2>Disa Aktar</h2>
      <div className="row tight-row">
        <button type="button" onClick={onDownloadPdf}>Vektor PDF</button>
        <button type="button" onClick={onPrint}>Yazdir</button>
      </div>
      <button type="button" onClick={onExportZpl}>ZPL Olustur</button>
      <textarea value={zplOutput} onChange={event => onZplChange(event.target.value)} placeholder="ZPL ciktisi burada olusur..." />
    </section>
  );
}
