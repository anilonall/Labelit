import { useEffect, useLayoutEffect, useState } from "react";

export function useSheetFrame({ sheetPreviewRef, printMode }) {
  const [frameStyle, setFrameStyle] = useState({});

  useLayoutEffect(() => {
    const preview = sheetPreviewRef.current;

    if (!preview) {
      return;
    }

    const previewWidth = preview.clientWidth - 12;
    const previewHeight = preview.clientHeight - 12;

    if (!previewWidth || !previewHeight) {
      return;
    }

    if (printMode === "thermal") {
      setFrameStyle({
        width: `${Math.min(previewWidth, 1220)}px`,
        height: `${Math.min(previewHeight, 940)}px`
      });
      return;
    }

    const pageRatio = 210 / 297;
    let pageWidth = Math.min(previewWidth, 820);
    let pageHeight = pageWidth / pageRatio;

    if (pageHeight > previewHeight) {
      pageHeight = previewHeight;
      pageWidth = pageHeight * pageRatio;
    }

    setFrameStyle({
      width: `${pageWidth}px`,
      height: `${pageHeight}px`
    });
  }, [sheetPreviewRef, printMode]);

  useEffect(() => {
    const handleResize = () => {
      const preview = sheetPreviewRef.current;

      if (!preview) {
        return;
      }

      const previewWidth = preview.clientWidth - 12;
      const previewHeight = preview.clientHeight - 12;

      if (!previewWidth || !previewHeight) {
        return;
      }

      if (printMode === "thermal") {
        setFrameStyle({
          width: `${Math.min(previewWidth, 1220)}px`,
          height: `${Math.min(previewHeight, 940)}px`
        });
        return;
      }

      const pageRatio = 210 / 297;
      let pageWidth = Math.min(previewWidth, 820);
      let pageHeight = pageWidth / pageRatio;

      if (pageHeight > previewHeight) {
        pageHeight = previewHeight;
        pageWidth = pageHeight * pageRatio;
      }

      setFrameStyle({
        width: `${pageWidth}px`,
        height: `${pageHeight}px`
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sheetPreviewRef, printMode]);

  return frameStyle;
}
