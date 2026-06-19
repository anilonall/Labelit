import { baseTemplates, builtInTemplateKeys, LIBRARY_KEY } from "../constants/templates";

export function isBuiltInTemplate(key) {
  return builtInTemplateKeys.includes(key);
}

export function loadTemplates() {
  if (typeof window === "undefined") {
    return { ...baseTemplates };
  }

  const merged = { ...baseTemplates };
  const raw = window.localStorage.getItem(LIBRARY_KEY);

  if (!raw) {
    return merged;
  }

  try {
    const parsed = JSON.parse(raw);
    return { ...merged, ...parsed };
  } catch {
    window.localStorage.removeItem(LIBRARY_KEY);
    return merged;
  }
}

export function persistCustomTemplates(templates) {
  const customTemplates = Object.fromEntries(
    Object.entries(templates).filter(([key]) => !isBuiltInTemplate(key))
  );

  window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(customTemplates));
}
