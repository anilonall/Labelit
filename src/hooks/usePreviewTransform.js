import { useEffect, useLayoutEffect, useState } from "react";
import { clamp } from "../utils/helpers";

const PREVIEW_FIT_PADDING = 0.88;
const PREVIEW_PAN_SLACK = 96;

export function usePreviewTransform({
  activeSlotRef,
  labelRef,
  dependencies,
  scale,
  previewOffset,
  setPreviewOffset
}) {
  const [previewTransform, setPreviewTransform] = useState("translate(-50%, -50%) scale(1)");

  useEffect(() => {
    const onResize = () => {
      setPreviewOffset(current => ({ x: current.x, y: current.y }));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setPreviewOffset]);

  useLayoutEffect(() => {
    const activeSlot = activeSlotRef.current;
    const label = labelRef.current;

    if (!activeSlot || !label) {
      return;
    }

    label.style.transform = "translate(-50%, -50%) scale(1)";
    const availableWidth = activeSlot.clientWidth - 12;
    const availableHeight = activeSlot.clientHeight - 12;
    const labelWidth = label.offsetWidth;
    const labelHeight = label.offsetHeight;

    if (!availableWidth || !availableHeight || !labelWidth || !labelHeight) {
      setPreviewTransform(`translate(-50%, -50%) scale(${scale})`);
      return;
    }

    const fitScale = Math.min(availableWidth / labelWidth, availableHeight / labelHeight, 1) * PREVIEW_FIT_PADDING;
    const finalScale = fitScale * scale;
    const scaledWidth = labelWidth * finalScale;
    const scaledHeight = labelHeight * finalScale;
    const maxOffsetX = Math.max(availableWidth * 0.5, Math.abs(availableWidth - scaledWidth) / 2 + PREVIEW_PAN_SLACK);
    const maxOffsetY = Math.max(availableHeight * 0.5, Math.abs(availableHeight - scaledHeight) / 2 + PREVIEW_PAN_SLACK);
    const clampedX = clamp(previewOffset.x, -maxOffsetX, maxOffsetX);
    const clampedY = clamp(previewOffset.y, -maxOffsetY, maxOffsetY);

    setPreviewTransform(
      `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px) scale(${finalScale})`
    );
  }, [activeSlotRef, labelRef, previewOffset, scale, setPreviewOffset, ...dependencies]);

  return previewTransform;
}
