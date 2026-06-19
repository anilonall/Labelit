import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function useCodeAssets({ barcodeRef, barcodeText, density, textColor, showQr }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!barcodeRef.current) {
      return;
    }

    JsBarcode(barcodeRef.current, barcodeText || "0000000000", {
      format: "CODE128",
      displayValue: true,
      fontSize: density === "compact" ? 11 : 14,
      lineColor: textColor,
      height: density === "compact" ? 62 : 72,
      margin: 0
    });
  }, [barcodeRef, barcodeText, density, textColor]);

  useEffect(() => {
    let cancelled = false;

    if (!showQr) {
      setQrDataUrl("");
      return undefined;
    }

    QRCode.toDataURL(barcodeText || "0000000000", {
      width: density === "compact" ? 72 : 85,
      margin: 0
    }).then(url => {
      if (!cancelled) {
        setQrDataUrl(url);
      }
    }).catch(() => {
      if (!cancelled) {
        setQrDataUrl("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [barcodeText, density, showQr]);

  return { qrDataUrl };
}
