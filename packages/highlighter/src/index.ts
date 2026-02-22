import { encodeCanvas } from "./encode-canvas.ts";
import { createHighlighter } from "./highlight.ts";

export { highlight } from "./highlight.ts";
export { encodeCanvas } from "./encode-canvas.ts";
export type { EncodeResult, HighlightOptions } from "./highlight.ts";
export type { Rgba, Token, Line, PixelEncoder } from "./types.ts";

export const highlightCode = createHighlighter(encodeCanvas);
