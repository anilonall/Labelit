export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function safe(value) {
  return String(value || "")
    .replace(/[\u011f\u011e]/g, "g")
    .replace(/[\u00fc\u00dc]/g, "u")
    .replace(/[\u015f\u015e]/g, "s")
    .replace(/[\u0131\u0130]/g, "i")
    .replace(/[\u00f6\u00d6]/g, "o")
    .replace(/[\u00e7\u00c7]/g, "c");
}

export function slugify(value) {
  return safe(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "benim-sablonum";
}

export function mmToInch(value) {
  return value / 25.4;
}
