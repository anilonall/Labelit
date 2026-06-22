export const defaultLayoutItems = {
  brand: { x: 4, y: 4, w: 38, h: 12, visible: true },
  title: { x: 58, y: 4, w: 38, h: 10, visible: true },
  sender: { x: 4, y: 18, w: 92, h: 12, visible: true },
  recipient: { x: 4, y: 32, w: 92, h: 16, visible: true },
  primary: { x: 4, y: 50, w: 92, h: 12, visible: true },
  secondary: { x: 4, y: 64, w: 92, h: 10, visible: true },
  custom: { x: 4, y: 76, w: 92, h: 10, visible: true },
  barcode: { x: 16, y: 80, w: 68, h: 12, visible: true },
  footer: { x: 4, y: 92, w: 92, h: 12, visible: true }
};

export const resizableLayoutKeys = ["brand", "title", "sender", "recipient", "primary", "secondary", "custom", "barcode", "footer"];

export function normalizeLayoutItems(layoutItems) {
  const next = { ...defaultLayoutItems };

  if (!layoutItems || typeof layoutItems !== "object") {
    return next;
  }

  Object.entries(defaultLayoutItems).forEach(([key, defaults]) => {
    next[key] = {
      x: Number(layoutItems[key]?.x ?? defaults.x),
      y: Number(layoutItems[key]?.y ?? defaults.y),
      w: Number(layoutItems[key]?.w ?? defaults.w),
      h: Number(layoutItems[key]?.h ?? defaults.h),
      visible: layoutItems[key]?.visible !== false
    };
  });

  return next;
}
