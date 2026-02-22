import Prism from "prismjs";
import "prismjs/components/prism-javascript";

export type Rgba = [r: number, g: number, b: number, a: number];
export type Theme = Record<string, Rgba>;
export type Token = [length: number, color: Rgba];
export type Line = Token[];

export interface TokenizeOptions {
  language?: string;
  theme?: Theme;
  fallbackColor?: Rgba;
}

export interface TokenizeResult {
  lines: Line[];
  width: number;
  height: number;
}

export interface RenderInput extends TokenizeOptions {
  code: string;
  lineHeightEm?: number;
  canvas?: HTMLCanvasElement;
}

export interface RenderOutput {
  dataUrl: string;
  backgroundSize: string;
  width: number;
  height: number;
}

export interface PixelBufferOutput {
  buffer: Uint8ClampedArray;
  width: number;
  height: number;
}

const defaultColor = hex("#abb2bf");
export const defaultFallbackColor: Rgba = [255, 0, 255, 255];

export const oneDarkTheme: Theme = {
  atrule: hex("#c678dd"),
  "attr-value": hex("#98c379"),
  boolean: hex("#d19a66"),
  builtin: hex("#98c379"),
  cdata: hex("#5c6370"),
  char: hex("#98c379"),
  comment: hex("#5c6370"),
  constant: hex("#d19a66"),
  deleted: hex("#d19a66"),
  doctype: hex("#5c6370"),
  entity: hex("#56b6c2"),
  function: hex("#61afef"),
  important: hex("#c678dd"),
  inserted: hex("#98c379"),
  keyword: hex("#c678dd"),
  number: hex("#d19a66"),
  operator: hex("#56b6c2"),
  prolog: hex("#5c6370"),
  property: hex("#d19a66"),
  punctuation: hex("#abb2bf"),
  regex: hex("#c678dd"),
  selector: hex("#e06c75"),
  string: hex("#98c379"),
  symbol: hex("#d19a66"),
  tag: hex("#e06c75"),
  url: hex("#56b6c2"),
  variable: hex("#c678dd"),
  default: defaultColor
};

export function tokenizeToLines(code: string, options: TokenizeOptions = {}): TokenizeResult {
  const language = options.language ?? "javascript";
  const theme = options.theme ?? oneDarkTheme;
  const fallbackColor = options.fallbackColor ?? defaultFallbackColor;
  const grammar = Prism.languages[language];

  if (!grammar) {
    throw new Error(`Prism language not registered: ${language}`);
  }

  const tokens = Prism.tokenize(code, grammar);
  const lines: Line[] = [];
  let currentLine: Line = [];
  lines.push(currentLine);

  const pushToken = (tokenStream: Prism.TokenStream): void => {
    const list = Array.isArray(tokenStream) ? tokenStream : [tokenStream];
    list.forEach(token => {
      if (typeof token === "string") {
        const splitLines = token.split("\n");

        for (let i = 0; i < splitLines.length - 1; i += 1) {
          const segment = splitLines[i] ?? "";
          currentLine.push([segment.length, theme.default ?? defaultColor]);
          currentLine = [];
          lines.push(currentLine);
        }

        const trailingSegment = splitLines[splitLines.length - 1] ?? "";
        currentLine.push([trailingSegment.length, theme.default ?? defaultColor]);
        return;
      }

      if (Array.isArray(token)) {
        pushToken(token);
        return;
      }

      currentLine.push([token.length, theme[token.type] ?? fallbackColor]);
    });
  };

  pushToken(tokens);

  let width = 0;
  for (const row of lines) {
    let rowWidth = 0;
    for (const [length] of row) {
      rowWidth += length;
    }
    if (rowWidth > width) {
      width = rowWidth;
    }
  }

  return {
    lines,
    width,
    height: lines.length
  };
}

export function renderToRgbaBuffer(input: RenderInput): PixelBufferOutput {
  const tokenized = tokenizeToLines(input.code, input);
  const safeWidth = Math.max(1, tokenized.width);
  const safeHeight = Math.max(1, tokenized.height);
  const buffer = new Uint8ClampedArray(safeWidth * safeHeight * 4);

  for (let y = 0; y < tokenized.lines.length; y += 1) {
    let x = 0;
    const row = tokenized.lines[y] ?? [];
    for (const [length, [r, g, b, a]] of row) {
      for (let i = 0; i < length; i += 1) {
        const off = (y * safeWidth + x + i) * 4;
        buffer[off] = r;
        buffer[off + 1] = g;
        buffer[off + 2] = b;
        buffer[off + 3] = a;
      }
      x += length;
    }
  }

  return {
    buffer,
    width: tokenized.width,
    height: tokenized.height
  };
}

export function getBackgroundSize(width: number, height: number, lineHeightEm = 1.5): string {
  return `${width}ch ${height * lineHeightEm}em`;
}

export function renderToDataUrl(input: RenderInput): RenderOutput {
  if (!input.canvas && typeof document === "undefined") {
    throw new Error("renderToDataUrl requires a browser canvas or `canvas` in input.");
  }

  const { buffer, width, height } = renderToRgbaBuffer(input);
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const canvas = input.canvas ?? document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("2D canvas context is unavailable.");
  }

  if (canvas.width !== safeWidth) {
    canvas.width = safeWidth;
  }
  if (canvas.height !== safeHeight) {
    canvas.height = safeHeight;
  }

  const imageData = ctx.createImageData(safeWidth, safeHeight);
  imageData.data.set(buffer);
  ctx.putImageData(imageData, 0, 0);

  return {
    dataUrl: canvas.toDataURL(),
    backgroundSize: getBackgroundSize(width, height, input.lineHeightEm ?? 1.5),
    width,
    height
  };
}

function hex(color: string): Rgba {
  const n = Number.parseInt(color.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}
