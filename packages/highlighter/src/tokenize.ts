import Prism from "prismjs";
import type { Line } from "./types.ts";
import { theme, fallbackColor } from "./theme.ts";

export interface TokenizeResult {
  lines: Line[];
  width: number;
  height: number;
}

export function getTokens(
  sourcecode: string,
  grammar: Prism.Grammar,
): TokenizeResult {
  const tokens = Prism.tokenize(sourcecode, grammar);
  const lines: Line[] = [];

  let currentLine: Line = [];
  lines.push(currentLine);

  (function pushTokens(tokens: ReturnType<typeof Prism.tokenize>) {
    tokens.forEach(token => {
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
  const height = lines.length;

  return { lines, width, height };
}
