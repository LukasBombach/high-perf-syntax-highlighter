import type { Rgba } from "./types.ts";

export function hex(color: string): Rgba {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}

export const theme = new Map<string, Rgba>([
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

export const fallbackColor: Rgba = [255, 0, 255, 255];
