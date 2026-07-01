export function printLabelFromElement(element, documentTitle = "label") {
  if (!element || typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const headMarkup = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(node => {
      if (node.tagName.toLowerCase() === "link") {
        const href = node.getAttribute("href");
        const absoluteHref = new URL(href || "", window.location.href).href;
        return `<link rel="stylesheet" href="${absoluteHref}" />`;
      }

      return node.outerHTML;
    })
    .join("\n");

  const contentMarkup = element.outerHTML;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 300);
  };

  const html = `
    <!doctype html>
    <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <base href="${window.location.origin}/" />
        <title>${documentTitle}</title>
        ${headMarkup}
        <style>
          @page {
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }

          body {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
          }

          .print-root {
            padding: 0;
            margin: 0;
          }

          .print-root .label {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
            overflow: hidden !important;
          }

          .print-root .layout-block {
            position: absolute !important;
          }

          .print-root .inline-edit-input,
          .print-root .layout-block-toolbar,
          .print-root .layout-resize-handle,
          .print-root .label-measure-badge,
          .print-root .ruler,
          .print-root .label-grid-overlay,
          .print-root .label-center-guide {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="print-root">${contentMarkup}</div>
      </body>
    </html>
  `;

  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument || frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    cleanup();
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  const triggerPrint = () => {
    frameWindow.focus();
    frameWindow.print();
    cleanup();
  };

  const images = Array.from(frameDocument.images);
  if (!images.length) {
    window.setTimeout(triggerPrint, 200);
    return;
  }

  let loadedCount = 0;
  const finalize = () => {
    loadedCount += 1;
    if (loadedCount >= images.length) {
      window.setTimeout(triggerPrint, 200);
    }
  };

  images.forEach(image => {
    if (image.complete) {
      finalize();
      return;
    }

    image.addEventListener("load", finalize, { once: true });
    image.addEventListener("error", finalize, { once: true });
  });
}
