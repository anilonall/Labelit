function StartupCard({ title, description, templateKey, children, onClick }) {
  return (
    <button type="button" className="startup-card" data-start-template={templateKey} onClick={onClick}>
      <div className={`startup-thumb ${templateKey ? `thumb-${templateKey}` : "blank-thumb"}`}>{children}</div>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function SavedTemplateThumb() {
  return (
    <div className="mini-label">
      <div className="mini-top"></div>
      <div className="mini-block"></div>
      <div className="mini-grid"></div>
      <div className="mini-barcode"></div>
    </div>
  );
}

export function StartupOverlay({ onBlankStart, onTemplateStart, savedTemplates }) {
  return (
    <div className="startup-overlay">
      <div className="startup-dialog">
        <p className="eyebrow">Hos Geldin</p>
        <h1>Etikete nasil baslamak istersin?</h1>
        <p className="panel-copy">Bos bir etiketle sifirdan ilerleyebilir ya da daha once kaydettigin sablonlardan biriyle hizli baslayabilirsin.</p>
        <div className="startup-grid">
          <StartupCard title="Bos Etiket" description="Sifirdan kendi duzenini kurmak isteyenler icin temiz baslangic." onClick={onBlankStart}>
            <div className="blank-sheet"></div>
          </StartupCard>
          {savedTemplates.map(([key, template]) => (
            <StartupCard
              key={key}
              title={template.name}
              description={template.description || "Kaydedilen ozel sablon."}
              templateKey={key}
              onClick={() => onTemplateStart(key)}
            >
              <SavedTemplateThumb />
            </StartupCard>
          ))}
        </div>
        {!savedTemplates.length && (
          <p className="panel-copy">Kaydedilen sablonun yoksa bos etiketle baslayip sonra kutuphaneye ekleyebilirsin.</p>
        )}
      </div>
    </div>
  );
}
