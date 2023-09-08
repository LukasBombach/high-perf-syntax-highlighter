"use client";

import { getHighlighter, setCDN } from "shiki";

import type { IThemedToken } from "shiki";

setCDN("/_next/static/shiki/");

const FALLBACK_COLOR = "#FF00FF";

const drawCanvas = (canvas: HTMLCanvasElement, linesOfTokens: IThemedToken[][]) => {
  const ctx = canvas.getContext("2d")!;
  const height = linesOfTokens.length;
  const width = linesOfTokens.reduce((max, line) => Math.max(max, line.length), 0);

  canvas.height = height;
  canvas.width = width;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < linesOfTokens[y].length; x++) {
      const token = linesOfTokens[y][x];
      const color = token.color || FALLBACK_COLOR;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
};

const sourceCode = `
const x = 10;

function hello() {
  console.log("Hello, world!", x);
}`.trim();

getHighlighter({
  theme: "nord",
}).then(highlighter => {
  console.log(JSON.stringify(highlighter.codeToThemedTokens(sourceCode, "js"), null, 2));
});

export function Editor() {
  return (
    <textarea
      className="w-full h-full outline-none caret-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      defaultValue={sourceCode}
    />
  );
}
