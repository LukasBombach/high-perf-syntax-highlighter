import type { Rgba, Theme, ThemeDefinition } from "../types";

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
