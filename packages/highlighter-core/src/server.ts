import { encode } from "fast-png";
import { buildRaster } from "./core";
import type { BackgroundResult, HighlighterOptions } from "./core";

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa === "function") {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  const maybeBuffer = (globalThis as { Buffer?: { from(data: Uint8Array): { toString(enc: string): string } } }).Buffer;
  if (maybeBuffer) {
    return maybeBuffer.from(bytes).toString("base64");
  }

  throw new Error("No base64 encoder available in this environment.");
}

export default function getBackground(code: string, options: HighlighterOptions): BackgroundResult {
  const { lines, width, height, size } = buildRaster(code, options);
  const rasterWidth = Math.max(width, 1);
  const rasterHeight = Math.max(height, 1);
  const buf = new Uint8Array(rasterWidth * rasterHeight * 3);

  for (let y = 0; y < lines.length; ++y) {
    let x = 0;
    for (const [length, [r, g, b]] of lines[y]) {
      for (let i = 0; i < length; ++i) {
        const off = (y * rasterWidth + x + i) * 3;
        buf[off] = r;
        buf[off + 1] = g;
        buf[off + 2] = b;
      }
      x += length;
    }
  }

  const png = encode({ width: rasterWidth, height: rasterHeight, data: buf, channels: 3, depth: 8 });
  const image = `data:image/png;base64,${bytesToBase64(png)}`;
  return { image, size };
}
