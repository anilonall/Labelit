function StartupCard({ title, description, templateKey, children, onClick }) {
  return (
    <button type="button" className="startup-card" data-start-template={templateKey} onClick={onClick}>
      <div className={`startup-thumb ${templateKey ? `thumb-${templateKey}` : "blank-thumb"}`}>{children}</div>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

export function StartupOverlay({ onBlankStart, onTemplateStart }) {
  return (
    <div className="startup-overlay">
      <div className="startup-dialog">
        <p className="eyebrow">Hos Geldin</p>
        <h1>Etikete nasil baslamak istersin?</h1>
        <p className="panel-copy">Bos bir etiketle sifirdan ilerleyebilir ya da hazir sablonlardan biriyle hizli baslayabilirsin.</p>
        <div className="startup-grid">
          <StartupCard title="Bos Etiket" description="Sifirdan kendi duzenini kurmak isteyenler icin temiz baslangic." onClick={onBlankStart}>
            <div className="blank-sheet"></div>
          </StartupCard>
          <StartupCard title="Sevkiyat Etiketi" description="Cikis, sevk ve dagitim operasyonlari icin genel sevkiyat duzeni." templateKey="shipping" onClick={() => onTemplateStart("shipping")}>
            <div className="mini-label"><div className="mini-top"></div><div className="mini-block"></div><div className="mini-block accent"></div><div className="mini-grid"></div><div className="mini-barcode"></div></div>
          </StartupCard>
          <StartupCard title="Kargo Etiketi" description="Kurye ve kargo teslimatlari icin barkod agirlikli standart kurgu." templateKey="cargo" onClick={() => onTemplateStart("cargo")}>
            <div className="mini-label"><div className="mini-top teal"></div><div className="mini-block"></div><div className="mini-grid"></div><div className="mini-barcode"></div></div>
          </StartupCard>
          <StartupCard title="Mal Kabul Etiketi" description="Giris kabul, urun kontrol ve depo kabul surecleri icin net alanlar." templateKey="receiving" onClick={() => onTemplateStart("receiving")}>
            <div className="mini-label soft"><div className="mini-top purple"></div><div className="mini-block accent soft-accent"></div><div className="mini-block"></div></div>
          </StartupCard>
          <StartupCard title="Iade Etiketi" description="Iade urunlerin ayrisma ve geri donus surecleri icin hizli tanimlama." templateKey="return" onClick={() => onTemplateStart("return")}>
            <div className="mini-label"><div className="mini-top red"></div><div className="mini-grid"></div><div className="mini-barcode"></div><div className="mini-block"></div></div>
          </StartupCard>
          <StartupCard title="Depo Transfer Etiketi" description="Lokasyonlar arasi urun hareketlerinde koli ve palet takibi icin." templateKey="transfer" onClick={() => onTemplateStart("transfer")}>
            <div className="mini-label"><div className="mini-top red"></div><div className="mini-block"></div><div className="mini-grid"></div><div className="mini-block accent"></div></div>
          </StartupCard>
          <StartupCard title="Palet Etiketi" description="Palet sevki, depo toplama ve saha takip operasyonlari icin buyuk barkodlu yapi." templateKey="pallet" onClick={() => onTemplateStart("pallet")}>
            <div className="mini-label"><div className="mini-top teal"></div><div className="mini-block accent"></div><div className="mini-grid"></div><div className="mini-barcode"></div></div>
          </StartupCard>
        </div>
      </div>
    </div>
  );
}
