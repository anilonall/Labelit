export function formatMeasurement(value, unit) {
  const normalized = String(value || "").trim();
  return normalized ? `${normalized} ${unit}`.trim() : "";
}

export function formatDeliveryTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getPrimaryStats(state) {
  const stats = [];
  if (state.showOrderNo) stats.push(["SIPARIS NO", state.orderNo]);
  if (state.showReference) stats.push(["REFERANS", state.reference]);
  if (state.showWeight) stats.push(["AGIRLIK", state.weight]);
  return stats;
}

export function getSecondaryStats(state) {
  const stats = [];
  if (state.showDistance) stats.push(["MESAFE", state.distance]);
  if (state.showDeliveryTime) stats.push(["TESLIMAT", state.deliveryTime]);
  if (state.showDeliveryTime) stats.push(["TIP", state.deliveryType]);
  return stats;
}
