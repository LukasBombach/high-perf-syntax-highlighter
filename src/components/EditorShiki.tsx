"use client";

import { useEffect, useRef, useState } from "react";
import { type Highlighter, getHighlighter, setCDN } from "shiki";
import { encode } from "bmp-js";

setCDN("/_next/static/shiki/");

const FALLBACK_COLOR = "#000000";

function createBMP(array: string[][]): string {
  const height = array.length;
  const width = Math.max(...array.map(row => row.length));

  const buffer = Buffer.alloc(width * height * 4);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = array[y][x] || FALLBACK_COLOR;
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      const a = 255;

      // ABGR
      buffer[offset] = a;
      buffer[offset + 1] = b;
      buffer[offset + 2] = g;
      buffer[offset + 3] = r;

      offset += 4;
    }
  }

  const bmpData = {
    data: buffer,
    width: width,
    height: height,
  };

  const rawData = encode(bmpData);
  return rawData.data.toString("base64");
}

const sourceCode = `
const x = 10;

function hello() {
  console.log("Hello, world!", x);
}`.trim();

function useHighlighter() {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    if (highlighter) return;
    getHighlighter({ theme: "one-dark-pro" })
      .then(setHighlighter)
      .then(() => console.debug("Highlighter loaded"));
  }, [highlighter]);

  return highlighter;
}

function useHighlightingBackgroundImage(
  highlighter: Highlighter | null,
  sourceCode: string
): [base64: string, width: number, height: number] {
  const [image, setImage] = useState<[base64: string, width: number, height: number]>(["", 0, 0]);

  useEffect(() => {
    if (!highlighter) return;
    const colors = highlighter
      .codeToThemedTokens(sourceCode, "js")
      .map(line =>
        line.flatMap(token => new Array(token.content.length).fill((token.color || FALLBACK_COLOR).substring(0, 7)))
      );
    const height = colors.length;
    const width = Math.max(...colors.map(row => row.length));
    const base64 = createBMP(colors);

    setImage([base64, width, height]);
  }, [highlighter, sourceCode]);

  return image;
}

export function Editor() {
  const [code, setCode] = useState(sourceCode);
  const highlighter = useHighlighter();
  const [bg, width, height] = useHighlightingBackgroundImage(highlighter, code);
  const ref = useRef<HTMLTextAreaElement>(null);

  if (ref.current && bg) {
    ref.current.style.backgroundImage = `url(data:image/bmp;base64,${bg})`;
    ref.current.style.backgroundSize = `${width}ch ${height * 1.5}em`;
  }

  return (
    <textarea
      className="w-full h-full outline-none caret-white font-mono bg-no-repeat [image-rendering:pixelated] bg-clip-text text-transparent"
      value={code}
      onChange={e => setCode(e.target.value)}
      ref={ref}
    />
  );
}
