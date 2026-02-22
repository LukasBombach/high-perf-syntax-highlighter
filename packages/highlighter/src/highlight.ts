import Prism from "prismjs";
import type { PixelEncoder, EncodeResult } from "./types.ts";
export type { EncodeResult } from "./types.ts";
import { getTokens } from "./tokenize.ts";
import { fillPixelBuffer } from "./pixelbuf.ts";

export interface HighlightOptions {
  language?: string;
  grammar?: Prism.Grammar;
}

export function highlight(
  code: string,
  encode: PixelEncoder,
  options?: HighlightOptions,
): EncodeResult {
  const grammar = options?.grammar
    ?? Prism.languages[options?.language ?? "javascript"];

  if (!grammar) {
    throw new Error(
      `Prism grammar for "${options?.language}" not loaded. ` +
      `Import "prismjs/components/prism-${options?.language}" first.`,
    );
  }

  const { lines, width, height } = getTokens(code, grammar);

  if (width === 0 || height === 0) {
    return { dataUrl: "", backgroundSize: "0ch 0em" };
  }

  const buf = fillPixelBuffer(lines, width, height);
  const dataUrl = encode(buf, width, height);
  const backgroundSize = `${width}ch ${height * 1.5}em`;

  return { dataUrl, backgroundSize };
}

export function createHighlighter(encode: PixelEncoder) {
  return (code: string, options?: HighlightOptions): EncodeResult =>
    highlight(code, encode, options);
}
