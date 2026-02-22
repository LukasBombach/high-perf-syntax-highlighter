import { encodePng } from "./encode-png.ts";
import { createHighlighter } from "./highlight.ts";

export { highlight } from "./highlight.ts";
export { encodePng } from "./encode-png.ts";
export type { EncodeResult, HighlightOptions } from "./highlight.ts";
export type { Rgba, Token, Line, PixelEncoder } from "./types.ts";

export const highlightCode = createHighlighter(encodePng);
