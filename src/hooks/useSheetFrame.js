import { useEffect, useLayoutEffect, useState } from "react";

export function useSheetFrame({ sheetPreviewRef }) {
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

    setFrameStyle({
      width: `${Math.min(previewWidth, 1220)}px`,
      height: `${Math.min(previewHeight, 940)}px`
    });
  }, [sheetPreviewRef]);

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

      setFrameStyle({
        width: `${Math.min(previewWidth, 1220)}px`,
        height: `${Math.min(previewHeight, 940)}px`
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sheetPreviewRef]);

  return frameStyle;
}
