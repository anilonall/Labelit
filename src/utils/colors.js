export function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map(char => char + char).join("") : value;
  const bigint = parseInt(normalized, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hexToRgbaHex(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  const mix = channel => Math.round((255 * (1 - alpha)) + (channel * alpha));
  return `#${[mix(r), mix(g), mix(b)].map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
}
