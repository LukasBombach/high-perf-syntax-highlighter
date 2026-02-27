import { encode } from "fast-png";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";

export type Rgba = [r: number, g: number, b: number, a: number];
export type Token = [length: number, color: Rgba];
export type Line = Token[];
export type BackgroundResult = { image: string; size: string };

function hex(color: string): Rgba {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}

const theme = new Map<string, Rgba>([
  ["atrule", hex("#c678dd")],
  ["attr-value", hex("#98c379")],
  ["boolean", hex("#d19a66")],
  ["builtin", hex("#98c379")],
  ["cdata", hex("#5C6370")],
  ["char", hex("#98c379")],
  ["comment", hex("#5C6370")],
  ["constant", hex("#d19a66")],
  ["deleted", hex("#d19a66")],
  ["doctype", hex("#5C6370")],
  ["entity", hex("#56b6c2")],
  ["function", hex("#61afef")],
  ["important", hex("#c678dd")],
  ["inserted", hex("#98c379")],
  ["keyword", hex("#c678dd")],
  ["number", hex("#d19a66")],
  ["operator", hex("#56b6c2")],
  ["prolog", hex("#5C6370")],
  ["property", hex("#d19a66")],
  ["punctuation", hex("#abb2bf")],
  ["regex", hex("#c678dd")],
  ["selector", hex("#e06c75")],
  ["string", hex("#98c379")],
  ["symbol", hex("#d19a66")],
  ["tag", hex("#e06c75")],
  ["url", hex("#56b6c2")],
  ["variable", hex("#c678dd")],
  ["default", hex("#abb2bf")],
]);

const fallbackColor: Rgba = [255, 0, 255, 255];
const javascript = Prism.languages["javascript"];
let canvasContext: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null = null;

function getCanvasContext() {
  if (canvasContext) return canvasContext;

  if (typeof document === "undefined") {
    throw new Error("getBackground can only run in a browser environment.");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create 2D canvas context.");
  }

  canvasContext = { canvas, ctx };
  return canvasContext;
}

export function getBackground(code: string): BackgroundResult {
  const { lines, width, height } = getTokens(code);
  const { canvas, ctx } = getCanvasContext();

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const buf = imageData.data;

  for (let y = 0; y < lines.length; ++y) {
    let x = 0;
    for (const [length, [r, g, b, a]] of lines[y]) {
      for (let i = 0; i < length; ++i) {
        const off = (y * width + x + i) * 4;
        buf[off] = r;
        buf[off + 1] = g;
        buf[off + 2] = b;
        buf[off + 3] = a;
      }
      x += length;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const image = canvas.toDataURL();
  const size = `${width}ch ${height * 1.5}em`;
  return { image, size };
}

export function getBackgroundSSR(code: string): BackgroundResult {
  const { lines, width, height } = getTokens(code);
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
  const size = `${width}ch ${height * 1.5}em`;
  return { image, size };
}

function getTokens(sourcecode: string): { lines: Line[]; width: number; height: number } {
  const tokens = Prism.tokenize(sourcecode, javascript);
  const lines: Line[] = [];

  let currentLine: Line = [];
  lines.push(currentLine);

  (function pushTokens(tokenStream: ReturnType<typeof Prism.tokenize>) {
    tokenStream.forEach(token => {
      if (typeof token === "string") {
        const splitLines = token.split("\n");

        for (let i = 0; i < splitLines.length - 1; i++) {
          currentLine.push([splitLines[i].length, theme.get("default")!]);
          currentLine = [];
          lines.push(currentLine);
        }
        currentLine.push([splitLines[splitLines.length - 1].length, theme.get("default")!]);
      } else if (Array.isArray(token)) {
        pushTokens(token);
      } else {
        currentLine.push([token.length, theme.get(token.type) ?? fallbackColor]);
      }
    });
  })(tokens);

  let width = 0;
  for (const row of lines) {
    let w = 0;
    for (const [length] of row) w += length;
    if (w > width) width = w;
  }

  return { lines, width, height: lines.length };
}

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
