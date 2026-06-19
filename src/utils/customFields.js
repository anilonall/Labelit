import { formatDeliveryTime } from "./formatters";

export const customFieldSourceOptions = [
  { key: "manual", label: { tr: "Manuel Metin", en: "Manual Text" } },
  { key: "currentDate", label: { tr: "Bugünün Tarihi", en: "Current Date" } },
  { key: "currentTime", label: { tr: "Şu Anki Saat", en: "Current Time" } },
  { key: "currentDateTime", label: { tr: "Tarih ve Saat", en: "Date & Time" } },
  { key: "barcode", label: { tr: "Barkod Değeri", en: "Barcode Value" } },
  { key: "orderNo", label: { tr: "Sipariş No", en: "Order No" } },
  { key: "reference", label: { tr: "Referans", en: "Reference" } },
  { key: "senderName", label: { tr: "Gönderen", en: "Sender" } },
  { key: "recipientName", label: { tr: "Alıcı", en: "Recipient" } },
  { key: "weight", label: { tr: "Ağırlık", en: "Weight" } },
  { key: "distance", label: { tr: "Mesafe", en: "Distance" } },
  { key: "deliveryTime", label: { tr: "Teslimat Zamanı", en: "Delivery Time" } },
  { key: "deliveryType", label: { tr: "Teslimat Tipi", en: "Delivery Type" } }
];

export function normalizeCustomFields(fields) {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields.map((field, index) => ({
    id: field?.id || `custom-field-${Date.now()}-${index}`,
    label: field?.label || "",
    value: field?.value || "",
    visible: field?.visible !== false,
    sourceType: field?.sourceType || "manual"
  }));
}

export function getCustomFieldSourceLabel(sourceType, language = "tr") {
  const match = customFieldSourceOptions.find(option => option.key === sourceType);
  if (!match) {
    return language === "en" ? "Manual Text" : "Manuel Metin";
  }

  return language === "en" ? match.label.en : match.label.tr;
}

export function resolveCustomFieldValue(field, form, stats) {
  switch (field.sourceType) {
    case "currentDate":
      return new Date().toLocaleDateString(form.uiLanguage === "en" ? "en-US" : "tr-TR");
    case "currentTime":
      return new Date().toLocaleTimeString(form.uiLanguage === "en" ? "en-US" : "tr-TR", { hour: "2-digit", minute: "2-digit" });
    case "currentDateTime":
      return formatDeliveryTime(new Date().toISOString(), form.uiLanguage);
    case "barcode":
      return form.barcodeText || "";
    case "orderNo":
      return form.orderNo || "";
    case "reference":
      return form.reference || "";
    case "senderName":
      return form.senderName || "";
    case "recipientName":
      return form.recipientName || "";
    case "weight":
      return stats?.weightText || "";
    case "distance":
      return stats?.distanceText || "";
    case "deliveryTime":
      return stats?.deliveryTimeText || "";
    case "deliveryType":
      return stats?.deliveryTypeText || "";
    case "manual":
    default:
      return field.value || "";
  }
}

export function resolveCustomFields(fields, form, stats) {
  return normalizeCustomFields(fields).map(field => ({
    ...field,
    value: resolveCustomFieldValue(field, form, stats)
  }));
}
