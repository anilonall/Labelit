export function formatMeasurement(value, unit) {
  const normalized = String(value || "").trim();
  return normalized ? `${normalized} ${unit}`.trim() : "";
}

import { getTranslator } from "../constants/i18n";

export function formatDeliveryTime(value, language = "tr") {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(language === "en" ? "en-US" : "tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getPrimaryStats(state) {
  const t = getTranslator(state.uiLanguage || "tr");
  const stats = [];
  if (state.showOrderNo) stats.push([t("labelOrderNo"), state.orderNo]);
  if (state.showReference) stats.push([t("labelReference"), state.reference]);
  if (state.showWeight) stats.push([t("labelWeight"), state.weight]);
  return stats;
}

export function getSecondaryStats(state) {
  const t = getTranslator(state.uiLanguage || "tr");
  const stats = [];
  if (state.showDistance) stats.push([t("labelDistance"), state.distance]);
  if (state.showDeliveryTime) stats.push([t("labelDelivery"), state.deliveryTime]);
  if (state.showDeliveryType) stats.push([t("labelType"), state.deliveryType]);
  return stats;
}
