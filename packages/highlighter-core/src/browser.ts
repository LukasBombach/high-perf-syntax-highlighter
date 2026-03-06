import { buildRaster } from "./core";
import type { BackgroundResult, HighlighterOptions } from "./core";

let canvasContext: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null = null;

function getCanvasContext() {
  if (canvasContext) return canvasContext;

  if (typeof document === "undefined") {
    throw new Error("Browser renderer can only run in a browser environment.");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create 2D canvas context.");
  }

  canvasContext = { canvas, ctx };
  return canvasContext;
}

export default function getBackground(code: string, options: HighlighterOptions): BackgroundResult {
  const { lines, width, height, size } = buildRaster(code, options);
  const { canvas, ctx } = getCanvasContext();
  const rasterWidth = Math.max(width, 1);
  const rasterHeight = Math.max(height, 1);

  if (canvas.width !== rasterWidth) canvas.width = rasterWidth;
  if (canvas.height !== rasterHeight) canvas.height = rasterHeight;

  const imageData = ctx.createImageData(rasterWidth, rasterHeight);
  const buf = imageData.data;

  for (let y = 0; y < lines.length; ++y) {
    let x = 0;
    for (const [length, [r, g, b, a]] of lines[y]) {
      for (let i = 0; i < length; ++i) {
        const off = (y * rasterWidth + x + i) * 4;
        buf[off] = r;
        buf[off + 1] = g;
        buf[off + 2] = b;
        buf[off + 3] = a;
      }
      x += length;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return { image: canvas.toDataURL(), size };
}
