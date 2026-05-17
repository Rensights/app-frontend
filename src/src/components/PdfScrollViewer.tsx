"use client";

import { useEffect, useRef, useState } from "react";

type PdfScrollViewerProps = {
  url: string;
  title: string;
};

/**
 * Renders PDF pages as canvases in a scrollable column — works on mobile Safari
 * where iframe/object PDF viewers often cannot scroll.
 */
export function PdfScrollViewer({ url, title }: PdfScrollViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    const render = async () => {
      setLoading(true);
      setError(null);
      container.innerHTML = "";

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;

        const containerWidth = container.clientWidth || window.innerWidth;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.max(containerWidth / baseViewport.width, 0.5);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 12px";
          canvas.setAttribute("role", "img");
          canvas.setAttribute(
            "aria-label",
            `${title} — page ${pageNum} of ${pdf.numPages}`
          );

          const context = canvas.getContext("2d");
          if (!context) continue;

          context.scale(pixelRatio, pixelRatio);
          await page.render({ canvasContext: context, viewport }).promise;
          container.appendChild(canvas);
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load PDF");
          setLoading(false);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [url, title]);

  return (
    <div className="pdf-scroll-viewer">
      {loading && !error && (
        <p className="pdf-scroll-viewer-status">Loading document…</p>
      )}
      {error && (
        <p className="pdf-scroll-viewer-error">
          Could not display this PDF here. Use &quot;Open in browser&quot; above.
        </p>
      )}
      <div ref={containerRef} className="pdf-scroll-viewer-pages" />
    </div>
  );
}
