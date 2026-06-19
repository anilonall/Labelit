function createPreset(key, width, height, descriptionTr, descriptionEn, label = null) {
  return {
    key,
    label: label || `${width} x ${height} mm`,
    width,
    height,
    description: {
      tr: descriptionTr,
      en: descriptionEn
    }
  };
}

export const sizePresetGroups = [
  {
    key: "shipping",
    label: { tr: "Kargo Etiketleri", en: "Shipping Labels" },
    presets: [
      createPreset("shipping-100x150", 100, 150, "Dunya standardi kargo etiketi.", "Global standard shipping label."),
      createPreset("shipping-102x152", 102, 152, "4 x 6 Zebra standardi.", "4 x 6 Zebra standard."),
      createPreset("shipping-100x100", 100, 100, "Kare kargo etiketi.", "Square shipping label."),
      createPreset("shipping-80x100", 80, 100, "Kompakt gonderi etiketi.", "Compact parcel label."),
      createPreset("shipping-150x100", 150, 100, "Buyuk sevkiyat ve palet etiketi.", "Large shipment and pallet label.")
    ]
  },
  {
    key: "product",
    label: { tr: "Urun Etiketleri", en: "Product Labels" },
    presets: [
      createPreset("product-20x10", 20, 10, "Cok kucuk urunler.", "Very small products."),
      createPreset("product-30x20", 30, 20, "Kozmetik ve kucuk urunler.", "Cosmetics and small products."),
      createPreset("product-40x20", 40, 20, "Barkod odakli urun etiketi.", "Barcode-focused product label."),
      createPreset("product-50x25", 50, 25, "Perakende barkod etiketi.", "Retail barcode label."),
      createPreset("product-50x30", 50, 30, "Market urun etiketi.", "Grocery product label."),
      createPreset("product-60x30", 60, 30, "Barkod ve kisa aciklama.", "Barcode with short description."),
      createPreset("product-60x40", 60, 40, "Urun bilgileri ve barkod.", "Product details and barcode."),
      createPreset("product-70x50", 70, 50, "Daha fazla bilgi icin.", "For more product information."),
      createPreset("product-80x50", 80, 50, "Orta boy urunler.", "Medium-sized products."),
      createPreset("product-100x50", 100, 50, "Buyuk barkod ve aciklamalar.", "Large barcode and descriptions.")
    ]
  },
  {
    key: "warehouse",
    label: { tr: "Depo Etiketleri", en: "Warehouse Labels" },
    presets: [
      createPreset("warehouse-100x50", 100, 50, "Raf lokasyonu ve stok etiketi.", "Shelf location and stock label."),
      createPreset("warehouse-100x100", 100, 100, "Buyuk depo lokasyon etiketi.", "Large warehouse location label."),
      createPreset("warehouse-100x150", 100, 150, "Palet ve sevkiyat etiketi.", "Pallet and shipment label."),
      createPreset("warehouse-150x100", 150, 100, "Buyuk koli ve paletler icin.", "For large boxes and pallets."),
      createPreset("warehouse-200x100", 200, 100, "Endustriyel depo etiketleri.", "Industrial warehouse labels.")
    ]
  },
  {
    key: "shelf",
    label: { tr: "Raf Etiketleri", en: "Shelf Labels" },
    presets: [
      createPreset("shelf-58x40", 58, 40, "Market raf etiketi.", "Retail shelf label."),
      createPreset("shelf-60x40", 60, 40, "Barkod ve fiyat etiketi.", "Barcode and price label."),
      createPreset("shelf-70x30", 70, 30, "Kucuk fiyat etiketi.", "Small price label."),
      createPreset("shelf-80x40", 80, 40, "Market ve magaza raf etiketi.", "Store and supermarket shelf label."),
      createPreset("shelf-100x40", 100, 40, "Uzun raf etiketi.", "Long shelf label.")
    ]
  },
  {
    key: "barcode",
    label: { tr: "Barkod Etiketleri", en: "Barcode Labels" },
    presets: [
      createPreset("barcode-40x20", 40, 20, "Kucuk barkod etiketi.", "Small barcode label."),
      createPreset("barcode-50x25", 50, 25, "Perakende urun barkodu.", "Retail product barcode."),
      createPreset("barcode-60x30", 60, 30, "Barkod ve urun kodu.", "Barcode and product code."),
      createPreset("barcode-80x40", 80, 40, "Barkod ve aciklama.", "Barcode with description."),
      createPreset("barcode-100x50", 100, 50, "Buyuk barkod etiketi.", "Large barcode label.")
    ]
  },
  {
    key: "laboratory",
    label: { tr: "Laboratuvar Etiketleri", en: "Laboratory Labels" },
    presets: [
      createPreset("lab-25x10", 25, 10, "Numune tupleri.", "Sample tubes."),
      createPreset("lab-50x25", 50, 25, "Laboratuvar kaplari.", "Laboratory containers."),
      createPreset("lab-60x30", 60, 30, "Kimyasal etiketleri.", "Chemical labels."),
      createPreset("lab-80x50", 80, 50, "Buyuk numune etiketleri.", "Large sample labels.")
    ]
  },
  {
    key: "pharmacy",
    label: { tr: "Eczane Etiketleri", en: "Pharmacy Labels" },
    presets: [
      createPreset("pharmacy-50x25", 50, 25, "Ilac kutulari.", "Medicine boxes."),
      createPreset("pharmacy-60x30", 60, 30, "Recete etiketi.", "Prescription label."),
      createPreset("pharmacy-80x40", 80, 40, "Hasta bilgisi etiketi.", "Patient information label.")
    ]
  },
  {
    key: "food",
    label: { tr: "Gida Etiketleri", en: "Food Labels" },
    presets: [
      createPreset("food-40x30", 40, 30, "Kucuk paketler.", "Small packages."),
      createPreset("food-60x40", 60, 40, "Gida urun bilgisi.", "Food product details."),
      createPreset("food-80x50", 80, 50, "SKT ve icerik etiketi.", "Expiry date and ingredients label."),
      createPreset("food-100x50", 100, 50, "Buyuk ambalaj etiketi.", "Large packaging label.")
    ]
  },
  {
    key: "textile",
    label: { tr: "Tekstil Etiketleri", en: "Textile Labels" },
    presets: [
      createPreset("textile-30x20", 30, 20, "Fiyat etiketi.", "Price label."),
      createPreset("textile-40x30", 40, 30, "Barkod etiketi.", "Barcode label."),
      createPreset("textile-50x30", 50, 30, "Urun etiketi.", "Product label."),
      createPreset("textile-60x40", 60, 40, "Marka ve barkod etiketi.", "Brand and barcode label.")
    ]
  },
  {
    key: "logistics",
    label: { tr: "Lojistik Etiketleri", en: "Logistics Labels" },
    presets: [
      createPreset("logistics-100x150", 100, 150, "Dunya standardi lojistik etiketi.", "Global standard logistics label."),
      createPreset("logistics-150x100", 150, 100, "Buyuk koli etiketi.", "Large box label."),
      createPreset("logistics-200x100", 200, 100, "Palet etiketi.", "Pallet label."),
      createPreset("logistics-a5", 210, 148, "Buyuk sevkiyat etiketi.", "Large shipment label.", "210 x 148 mm (A5)")
    ]
  },
  {
    key: "paper",
    label: { tr: "Kagit Standartlari", en: "Paper Standards" },
    presets: [
      createPreset("paper-a7", 74, 105, "Kucuk bilgi etiketi.", "Small info label.", "A7"),
      createPreset("paper-a6", 105, 148, "Gonderi etiketi.", "Shipping label.", "A6"),
      createPreset("paper-a5", 148, 210, "Buyuk kargo etiketi.", "Large shipping label.", "A5"),
      createPreset("paper-a4", 210, 297, "Tam sayfa tasarim.", "Full-page layout.", "A4")
    ]
  },
  {
    key: "custom",
    label: { tr: "Ozel Boyut", en: "Custom Size" },
    presets: [
      {
        key: "custom",
        label: "Ozel Boyut",
        width: null,
        height: null,
        description: {
          tr: "Genislik ve yukseklik alanlarini elle gir.",
          en: "Enter width and height manually."
        }
      }
    ]
  }
];

export function getGroupByKey(groupKey) {
  return sizePresetGroups.find(group => group.key === groupKey) || sizePresetGroups[0];
}

export function getPresetByKey(groupKey, presetKey) {
  const group = getGroupByKey(groupKey);
  return group.presets.find(preset => preset.key === presetKey) || group.presets[0];
}

export function getLocalizedGroupLabel(group, language) {
  if (!group) {
    return "";
  }

  return language === "en" ? group.label.en : group.label.tr;
}

export function getLocalizedPresetDescription(preset, language) {
  if (!preset) {
    return "";
  }

  return preset.description?.[language] || preset.description?.tr || "";
}
