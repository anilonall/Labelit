export const fontFamilyOptions = [
  { key: "segoe", label: "Segoe UI", css: '"Segoe UI", sans-serif', pdf: "helvetica" },
  { key: "arial", label: "Arial", css: "Arial, sans-serif", pdf: "helvetica" },
  { key: "trebuchet", label: "Trebuchet MS", css: '"Trebuchet MS", sans-serif', pdf: "helvetica" },
  { key: "verdana", label: "Verdana", css: "Verdana, sans-serif", pdf: "helvetica" },
  { key: "georgia", label: "Georgia", css: "Georgia, serif", pdf: "times" },
  { key: "times", label: "Times New Roman", css: '"Times New Roman", serif', pdf: "times" },
  { key: "courier", label: "Courier New", css: '"Courier New", monospace', pdf: "courier" }
];

export function getFontOption(fontKey) {
  return fontFamilyOptions.find(option => option.key === fontKey) || fontFamilyOptions[0];
}
