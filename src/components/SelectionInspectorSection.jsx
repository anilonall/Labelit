import { defaultLayoutItems } from "../constants/layoutItems";

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

function getInspectorLabel(itemKey, t) {
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

function clampPercent(value, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.min(max, Math.max(0, numeric));
}

export function SelectionInspectorSection({
  t,
  selectedKey,
  frame,
  onLayoutItemChange
}) {
  const alignHorizontally = position => {
    const nextX = position === "left"
      ? 0
      : position === "center"
        ? (100 - frame.w) / 2
        : 100 - frame.w;

    onLayoutItemChange?.(selectedKey, { x: clampPercent(nextX, Math.max(0, 100 - frame.w)) });
  };

  const alignVertically = position => {
    const nextY = position === "top"
      ? 0
      : position === "middle"
        ? (100 - frame.h) / 2
        : 100 - frame.h;

    onLayoutItemChange?.(selectedKey, { y: clampPercent(nextY, Math.max(0, 100 - frame.h)) });
  };

  const resizePreset = preset => {
    if (preset === "compact") {
      onLayoutItemChange?.(selectedKey, {
        w: Math.max(12, clampPercent(28, Math.max(12, 100 - frame.x))),
        h: Math.max(8, clampPercent(14, Math.max(8, 100 - frame.y)))
      });
      return;
    }

    if (preset === "balanced") {
      onLayoutItemChange?.(selectedKey, {
        w: Math.max(12, clampPercent(38, Math.max(12, 100 - frame.x))),
        h: Math.max(8, clampPercent(18, Math.max(8, 100 - frame.y)))
      });
      return;
    }

    onLayoutItemChange?.(selectedKey, {
      w: Math.max(12, clampPercent(52, Math.max(12, 100 - frame.x))),
      h: Math.max(8, clampPercent(24, Math.max(8, 100 - frame.y)))
    });
  };

  const applyLayoutPreset = preset => {
    if (preset === "fullWidth") {
      onLayoutItemChange?.(selectedKey, { x: 4, w: 92 });
      return;
    }

    if (preset === "leftCard") {
      onLayoutItemChange?.(selectedKey, { x: 4, w: 44 });
      return;
    }

    if (preset === "rightCard") {
      onLayoutItemChange?.(selectedKey, { x: 52, w: 44 });
      return;
    }

    if (preset === "footerStrip") {
      onLayoutItemChange?.(selectedKey, { x: 4, y: 88, w: 92, h: 8 });
    }
  };

  const resetToDefault = () => {
    const defaults = defaultLayoutItems[selectedKey];
    if (!defaults) {
      return;
    }

    onLayoutItemChange?.(selectedKey, { ...defaults });
  };

  if (!selectedKey || !frame) {
    return (
      <section className="panel-section selection-inspector-section">
        <div className="section-head">
          <h2>{t("layoutPalette")}</h2>
          <p className="panel-copy compact-copy">Onizlemede bir alan sec, konumunu ve boyutunu buradan ince ayarla.</p>
        </div>
      </section>
    );
  }

  const label = getInspectorLabel(selectedKey, t);

  return (
    <section className="panel-section selection-inspector-section">
      <div className="section-head">
        <div>
          <h2>{label}</h2>
          <p className="panel-copy compact-copy">Cift tikla icerigi duzenle, tutup tasiyarak yer degistir, buradan olculeri netlestir.</p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={frame.visible !== false}
            onChange={event => onLayoutItemChange?.(selectedKey, { visible: event.target.checked })}
          />
          <span>{frame.visible !== false ? "Gorunur" : "Gizli"}</span>
        </label>
      </div>

      <div className="inline-fields inspector-grid">
        <div>
          <label htmlFor={`inspector-x-${selectedKey}`}>X</label>
          <input
            id={`inspector-x-${selectedKey}`}
            type="number"
            min="0"
            max={Math.max(0, 100 - frame.w)}
            step="1"
            value={Math.round(frame.x)}
            onChange={event => onLayoutItemChange?.(selectedKey, { x: clampPercent(event.target.value, Math.max(0, 100 - frame.w)) })}
          />
        </div>
        <div>
          <label htmlFor={`inspector-y-${selectedKey}`}>Y</label>
          <input
            id={`inspector-y-${selectedKey}`}
            type="number"
            min="0"
            max={Math.max(0, 100 - frame.h)}
            step="1"
            value={Math.round(frame.y)}
            onChange={event => onLayoutItemChange?.(selectedKey, { y: clampPercent(event.target.value, Math.max(0, 100 - frame.h)) })}
          />
        </div>
      </div>

      <div className="inline-fields inspector-grid">
        <div>
          <label htmlFor={`inspector-w-${selectedKey}`}>W</label>
          <input
            id={`inspector-w-${selectedKey}`}
            type="number"
            min="12"
            max={Math.max(12, 100 - frame.x)}
            step="1"
            value={Math.round(frame.w)}
            onChange={event => onLayoutItemChange?.(selectedKey, { w: Math.max(12, clampPercent(event.target.value, Math.max(12, 100 - frame.x))) })}
          />
        </div>
        <div>
          <label htmlFor={`inspector-h-${selectedKey}`}>H</label>
          <input
            id={`inspector-h-${selectedKey}`}
            type="number"
            min="8"
            max={Math.max(8, 100 - frame.y)}
            step="1"
            value={Math.round(frame.h)}
            onChange={event => onLayoutItemChange?.(selectedKey, { h: Math.max(8, clampPercent(event.target.value, Math.max(8, 100 - frame.y))) })}
          />
        </div>
      </div>

      <div className="selection-tools">
        <div className="selection-tool-group">
          <small>Hizala</small>
          <div className="selection-tool-row">
            <button type="button" className="ghost-button" onClick={() => alignHorizontally("left")}>Sol</button>
            <button type="button" className="ghost-button" onClick={() => alignHorizontally("center")}>Orta</button>
            <button type="button" className="ghost-button" onClick={() => alignHorizontally("right")}>Sag</button>
          </div>
          <div className="selection-tool-row">
            <button type="button" className="ghost-button" onClick={() => alignVertically("top")}>Ust</button>
            <button type="button" className="ghost-button" onClick={() => alignVertically("middle")}>Merkez</button>
            <button type="button" className="ghost-button" onClick={() => alignVertically("bottom")}>Alt</button>
          </div>
        </div>

        <div className="selection-tool-group">
          <small>Standart Boyut</small>
          <div className="selection-tool-row">
            <button type="button" className="ghost-button" onClick={() => resizePreset("compact")}>Kompakt</button>
            <button type="button" className="ghost-button" onClick={() => resizePreset("balanced")}>Dengeli</button>
            <button type="button" className="ghost-button" onClick={() => resizePreset("wide")}>Genis</button>
          </div>
          <p className="panel-copy compact-copy">Ipuclari: Ok tuslari ile 1 birim, `Shift + ok` ile 5 birim tasiyabilirsin.</p>
        </div>

        <div className="selection-tool-group">
          <small>Hazir Yerlesim</small>
          <div className="selection-tool-row">
            <button type="button" className="ghost-button" onClick={() => applyLayoutPreset("fullWidth")}>Tam Genis</button>
            <button type="button" className="ghost-button" onClick={() => applyLayoutPreset("leftCard")}>Sol Kart</button>
            <button type="button" className="ghost-button" onClick={() => applyLayoutPreset("rightCard")}>Sag Kart</button>
          </div>
          <div className="selection-tool-row single-row">
            <button type="button" className="ghost-button" onClick={() => applyLayoutPreset("footerStrip")}>Alt Serit</button>
          </div>
        </div>

        <div className="selection-tool-group">
          <small>Hizli Islem</small>
          <div className="selection-tool-row single-row">
            <button type="button" className="ghost-button" onClick={resetToDefault}>Varsayilana Don</button>
          </div>
        </div>
      </div>
    </section>
  );
}
