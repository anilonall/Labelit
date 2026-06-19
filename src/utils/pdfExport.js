import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { getTranslator } from "../constants/i18n";
import { getFontOption } from "../constants/typography";
import { hexToRgb, hexToRgbaHex } from "./colors";
import { getPrimaryStats, getSecondaryStats } from "./formatters";
import { mmToInch } from "./helpers";

function wrapText(pdf, text, maxWidth) {
  return pdf.splitTextToSize(String(text || ""), maxWidth);
}

async function buildBarcodeCanvas(value, showBarcodeValue) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, value || "0000000000", {
    format: "CODE128",
    displayValue: showBarcodeValue,
    fontSize: 14,
    height: 70,
    margin: 0
  });

  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 220;
  const ctx = canvas.getContext("2d");
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise(resolve => {
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.src = url;
  });
}

async function buildQrImage(value, enabled) {
  if (!enabled) {
    return null;
  }

  return QRCode.toDataURL(value || "0000000000", { width: 180, margin: 0 });
}

function drawTextBlock(pdf, title, strongText, bodyText, x, y, width, textRgb, highlight, accentColor, sizes, fontName) {
  const pad = 0.12;
  const left = x + pad;
  const right = x + width - pad;

  if (highlight) {
    pdf.setFillColor(...hexToRgb(hexToRgbaHex(accentColor, 0.12)));
    pdf.roundedRect(left, y + 0.02, width - (pad * 2), 0.86, 0.04, 0.04, "F");
  }

  pdf.setTextColor(...textRgb);
  pdf.setFont(fontName, "bold");
  pdf.setFontSize(sizes.heading);
  pdf.text(title, left, y + 0.12);
  pdf.setFontSize(highlight ? sizes.recipient : sizes.strong);
  pdf.text(String(strongText || "-"), left, y + 0.28);
  pdf.setFont(fontName, "normal");
  pdf.setFontSize(sizes.body);
  const lines = wrapText(pdf, bodyText || "-", (right - left) * 72);
  pdf.text(lines, left, y + 0.43);
  pdf.line(left, y + 0.78, right, y + 0.78);
  return y + 0.88;
}

function drawMetaGrid(pdf, stats, x, y, w, pad, sizes, fontName) {
  if (!stats.length) {
    return y;
  }

  const statWidth = (w - (pad * 2)) / stats.length;
  pdf.line(x + pad, y, x + w - pad, y);
  stats.forEach((stat, index) => {
    const sx = x + pad + (statWidth * index);
    pdf.setFont(fontName, "bold");
    pdf.setFontSize(sizes.heading);
    pdf.text(stat[0], sx + 0.03, y + 0.14);
    pdf.setFont(fontName, "normal");
    pdf.setFontSize(sizes.metaValue);
    pdf.text(String(stat[1] || "-"), sx + 0.03, y + 0.28);
    if (index < stats.length - 1) {
      pdf.line(sx + statWidth, y, sx + statWidth, y + 0.36);
    }
  });
  return y + 0.4;
}

function drawVectorLabelWithAssets(pdf, state, x, y, w, h, barcodeData, qrData) {
  const pad = 0.12;
  const accent = hexToRgb(state.accentColor);
  const border = hexToRgb(state.borderColor);
  const text = hexToRgb(state.textColor);
  const t = getTranslator(state.uiLanguage || "tr");
  const fontOption = getFontOption(state.fontFamily);
  const fontName = fontOption.pdf;
  const sizes = {
    brand: Math.max(10, Number(state.brandFontSize) * 0.6),
    title: Math.max(8, Number(state.titleFontSize) * 0.7),
    heading: Math.max(6, Number(state.headingFontSize) * 0.7),
    strong: Math.max(8, Number(state.bodyFontSize) * 0.78),
    recipient: Math.max(10, Number(state.bodyFontSize) * 1.02),
    body: Math.max(6, Number(state.bodyFontSize) * 0.62),
    metaValue: Math.max(6, Number(state.bodyFontSize) * 0.62)
  };

  pdf.setFillColor(...hexToRgb(state.backgroundColor));
  pdf.setDrawColor(...border);
  pdf.setLineWidth(0.02);
  pdf.roundedRect(x, y, w, h, 0.05, 0.05, "FD");

  let cursorY = y + pad;

  if (state.logoDataUrl) {
    pdf.addImage(state.logoDataUrl, "PNG", x + pad, cursorY, 0.7, 0.28, undefined, "FAST");
  } else {
    pdf.setTextColor(...accent);
    pdf.setFont(fontName, "bold");
    pdf.setFontSize(sizes.brand);
    pdf.text(state.brandName, x + pad, cursorY + 0.13);
  }

  pdf.setTextColor(...accent);
  pdf.setFont(fontName, "bold");
  pdf.setFontSize(sizes.title);
  pdf.text(state.labelTitle, x + w - pad, cursorY + 0.12, { align: "right" });

  cursorY += 0.3;
  pdf.setDrawColor(...text);
  pdf.line(x + pad, cursorY, x + w - pad, cursorY);
  cursorY += 0.08;

  if (state.showSender) {
    cursorY = drawTextBlock(
      pdf,
      t("labelSender"),
      state.senderName,
      state.showSenderAddress ? state.senderAddress : "",
      x,
      cursorY,
      w,
      text,
      false,
      state.accentColor,
      sizes,
      fontName
    );
  }

  if (state.showRecipient) {
    cursorY = drawTextBlock(
      pdf,
      t("labelRecipient"),
      state.recipientName,
      state.showRecipientAddress ? state.recipientAddress : "",
      x,
      cursorY,
      w,
      text,
      state.highlightRecipient,
      state.accentColor,
      sizes,
      fontName
    );
  }

  const stats = getPrimaryStats(state);
  cursorY = drawMetaGrid(pdf, stats, x, cursorY, w, pad, sizes, fontName);

  const secondaryStats = getSecondaryStats(state);
  cursorY = drawMetaGrid(pdf, secondaryStats, x, cursorY, w, pad, sizes, fontName);

  if (state.showBarcode) {
    pdf.addImage(barcodeData, "PNG", x + pad, cursorY + 0.05, w - (pad * 2), 0.8, undefined, "FAST");
    cursorY += 0.95;
  }

  if (state.showQr || state.showNote) {
    pdf.line(x + pad, cursorY, x + w - pad, cursorY);
    cursorY += 0.08;
  }

  if (state.showQr && qrData) {
    pdf.addImage(qrData, "PNG", x + pad, cursorY, 0.72, 0.72, undefined, "FAST");
  }

  if (state.showNote) {
    pdf.setFont(fontName, "bold");
    pdf.setFontSize(sizes.heading);
    pdf.text(t("labelNote"), x + pad + (state.showQr ? 0.82 : 0), cursorY + 0.12);
    pdf.setFont(fontName, "normal");
    pdf.setFontSize(sizes.body);
    const noteLines = wrapText(pdf, state.note || "-", (w - (pad * 2) - (state.showQr ? 0.9 : 0)) * 72);
    pdf.text(noteLines, x + pad + (state.showQr ? 0.82 : 0), cursorY + 0.25);
  }
}

export async function createPdfDocument(state) {
  const pageFormat = state.printMode === "a4" ? "a4" : [mmToInch(state.labelWidthMm), mmToInch(state.labelHeightMm)];
  const orientation = state.printMode === "a4" ? "portrait" : (state.labelWidthMm > state.labelHeightMm ? "landscape" : "portrait");
  const pdf = new jsPDF({ orientation, unit: "in", format: pageFormat, compress: false });
  const barcodeCanvas = await buildBarcodeCanvas(state.barcodeText || "0000000000", state.showBarcodeValue);
  const barcodeData = barcodeCanvas.toDataURL("image/png");
  const qrData = await buildQrImage(state.barcodeText || "0000000000", state.showQr);

  if (state.printMode === "a4") {
    const cols = 1;
    const rows = 1;
    const labelWidth = mmToInch(state.labelWidthMm);
    const labelHeight = mmToInch(state.labelHeightMm);
    const marginTop = mmToInch(state.pageMarginTop);
    const marginSide = mmToInch(state.pageMarginSide);
    const gap = mmToInch(state.sheetGap);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = marginSide + col * (labelWidth + gap);
        const y = marginTop + row * (labelHeight + gap);
        if (x + labelWidth <= 8.27 && y + labelHeight <= 11.69) {
          drawVectorLabelWithAssets(pdf, state, x, y, labelWidth, labelHeight, barcodeData, qrData);
        }
      }
    }
  } else {
    drawVectorLabelWithAssets(
      pdf,
      state,
      0,
      0,
      mmToInch(state.labelWidthMm),
      mmToInch(state.labelHeightMm),
      barcodeData,
      qrData
    );
  }

  return pdf;
}
