import type Prism from "prismjs";

export type Rgba = [r: number, g: number, b: number, a: number];
export type Token = [length: number, color: Rgba];
export type Line = Token[];
export type BackgroundResult = { image: string; size: string };
export type Theme = ReadonlyMap<string, Rgba>;
export type ThemeDefinition = Readonly<Record<string, Rgba | string>>;
export type Language = Prism.Grammar;

export type HighlighterOptions = {
  language: Language;
  theme: Theme;
  lineHeight?: number;
};
