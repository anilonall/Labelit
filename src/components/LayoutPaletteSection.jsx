const DEFAULT_LABELS = {
  brand: "Logo / Marka",
  title: "Baslik",
  sender: "Gonderen",
  recipient: "Alici",
  primary: "Ana Bilgiler",
  secondary: "Ikinci Bilgiler",
  custom: "Ozel Alanlar",
  barcode: "Barkod",
  footer: "Alt Alan"
};

function getPaletteLabel(itemKey, t) {
  const translationMap = {
    brand: t("paletteBrand"),
    title: t("paletteTitle"),
    sender: t("paletteSender"),
    recipient: t("paletteRecipient"),
    primary: t("palettePrimary"),
    secondary: t("paletteSecondary"),
    custom: t("paletteCustom"),
    barcode: t("paletteBarcode"),
    footer: t("paletteFooter")
  };

  return translationMap[itemKey] || DEFAULT_LABELS[itemKey] || itemKey;
}

export function LayoutPaletteSection({ t, items }) {
  return (
    <section className="panel-section">
      <div className="section-head">
        <h2>{t("layoutPalette")}</h2>
        <p className="panel-copy compact-copy">{t("layoutPaletteHint")}</p>
      </div>
      <div className="layout-palette-grid">
        {items.map(item => (
          <button
            key={item.key}
            type="button"
            draggable
            className={`layout-palette-item ${item.visible ? "active" : ""}`}
            onDragStart={event => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("application/x-labelit-layout-item", item.key);
              event.dataTransfer.setData("text/plain", item.key);
            }}
          >
            <strong>{getPaletteLabel(item.key, t)}</strong>
            <span>{item.visible ? t("paletteVisible") : t("paletteHidden")}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
