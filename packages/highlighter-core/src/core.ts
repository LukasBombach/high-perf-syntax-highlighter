import Prism from "prismjs";

import type { HighlighterOptions, Line, Rgba, Theme, ThemeDefinition } from "./types";

const FALLBACK_COLOR: Rgba = [255, 0, 255, 255];

type Raster = {
  lines: Line[];
  width: number;
  height: number;
  size: string;
};

export function buildRaster(code: string, options: HighlighterOptions): Raster {
  const { language, theme } = options;
  const lineHeight = options.lineHeight ?? 1.5;
  const tokens = Prism.tokenize(code, language);
  const lines: Line[] = [[]];
  const defaultColor = theme.get("default") ?? FALLBACK_COLOR;
  let currentLine = lines[0];

  const pushText = (text: string, color: Rgba) => {
    const split = text.split("\n");

    for (let i = 0; i < split.length; i++) {
      const segmentLength = split[i].length;
      if (segmentLength > 0) {
        currentLine.push([segmentLength, color]);
      }

      if (i < split.length - 1) {
        currentLine = [];
        lines.push(currentLine);
      }
    }
  };

  const walk = (stream: Prism.TokenStream, parentColor: Rgba) => {
    if (typeof stream === "string") {
      pushText(stream, parentColor);
      return;
    }

    if (stream instanceof Prism.Token) {
      const color = theme.get(stream.type) ?? parentColor;
      walk(stream.content, color);
      return;
    }

    for (const token of stream) walk(token, parentColor);
  };

  walk(tokens, defaultColor);

  let width = 0;
  for (const line of lines) {
    let lineWidth = 0;
    for (const [length] of line) lineWidth += length;
    if (lineWidth > width) width = lineWidth;
  }

  return {
    lines,
    width,
    height: lines.length,
    size: `${width}ch ${lines.length * lineHeight}em`,
  };
}

function parseHex(color: string): Rgba {
  const normalized = color.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color "${color}". Expected format "#rrggbb".`);
  }

  const n = parseInt(normalized.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}

export function createTheme(themeDefinition: ThemeDefinition): Theme {
  const entries: Array<[string, Rgba]> = [];

  for (const [tokenType, color] of Object.entries(themeDefinition)) {
    entries.push([tokenType, typeof color === "string" ? parseHex(color) : color]);
  }

  return new Map(entries);
}
