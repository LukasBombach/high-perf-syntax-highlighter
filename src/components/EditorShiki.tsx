"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { getHighlighter, setCDN, type Highlighter } from "shiki";
import { encode } from "bmp-js";
import { red, purple } from "@/components/imgs";

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

function createPng(data: string[][]) {
  var canvas = document.createElement("canvas");
  const height = data.length;
  const width = Math.max(...data.map(row => row.length));

  canvas.width = width;
  canvas.height = height;
  //canvas.style.visibility = "hidden";
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No context");

  for (var y = 0; y < data.length; ++y) {
    for (var x = 0; x < data[y].length; ++x) {
      ctx.fillStyle = data[y][x] || FALLBACK_COLOR;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL("image/png");
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
  sourceCode: string,
  ref: RefObject<HTMLTextAreaElement>
) /* : [base64: string, width: number, height: number] */ {
  // const [image, setImage] = useState<[base64: string, width: number, height: number]>(["", 0, 0]);
  const image = useRef<{ base64: string; width: number; height: number; dirty: boolean }>({
    base64: "",
    width: 0,
    height: 0,
    dirty: false,
  });

  const foo = useRef(0);

  const lastUpdateTime = useRef(0);
  const frameDuration = 1000 / 30; // Duration for 30 FPS in milliseconds

  useEffect(() => {
    if (!highlighter) return;
    const colors = highlighter
      .codeToThemedTokens(sourceCode, "js")
      .map(line =>
        line.flatMap(token => new Array(token.content.length).fill((token.color || FALLBACK_COLOR).substring(0, 7)))
      );

    const height = colors.length;
    const width = Math.max(...colors.map(row => row.length));
    const base64 = createPng(colors);

    image.current = { base64, width, height, dirty: true };

    if (image.current.dirty) {
      requestAnimationFrame(currentTime => {
        const deltaTime = currentTime - lastUpdateTime.current;
        if (deltaTime < frameDuration) {
          return;
        }
        lastUpdateTime.current = currentTime - (deltaTime % frameDuration);

        // ref.current!.style.setProperty("--bg-base64", `url(${base64})`);
        // ref.current!.style.setProperty("--bg-size", `${width}ch ${height * 1.5}em`);

        ref.current!.style.backgroundImage = `url(${base64})`;
        ref.current!.style.backgroundSize = `${width}ch ${height * 1.5}em`;

        image.current.dirty = false;

        // if (foo.current++ % 2 === 0) {
        // ref.current!.style.setProperty("--bg-base64", `url(${red})`);
        // ref.current!.style.setProperty("--bg-base64", `url(${base64})`);
        // ref.current!.style.setProperty("--bg-size", `${width}ch ${height * 1.5}em`);
        //ref.current!.style.setProperty("--bg-size", `100% 100%`);
        // } else {
        // ref.current!.style.setProperty("--bg-base64", `url(${purple})`);
        // ref.current!.style.setProperty("--bg-base64", `url(${base64})`);
        // ref.current!.style.setProperty("--bg-size", `${width}ch ${height * 1.5}em`);
        //ref.current!.style.setProperty("--bg-size", `98% 98%`);
        // }
      });
    }
  }, [highlighter, sourceCode, ref, frameDuration]);

  // return image;
}

export function Editor() {
  const [code, setCode] = useState(sourceCode);
  const ref = useRef<HTMLTextAreaElement>(null);
  const highlighter = useHighlighter();
  /* const [bg, width, height] = */
  useHighlightingBackgroundImage(highlighter, code, ref);

  /* if (ref.current && bg) {
    ref.current.style.setProperty("--bg-base64", `url(data:image/bmp;base64,${bg})`);
    ref.current.style.setProperty("--bg-size", `${width}ch ${height * 1.5}em`);
  } */

  /* useEffect(() => {
    let i = 0;

    const r = setInterval(() => {
      if (ref.current) {
        if (i++ % 2 === 0) ref.current.style.backgroundImage = img2;
        else ref.current.style.backgroundImage = img1;
      }
    }, 500);

    return () => clearInterval(r);
  }, []); */

  const image = useRef<{ base64: string; width: number; height: number; dirty: boolean }>({
    base64: "",
    width: 0,
    height: 0,
    dirty: false,
  });

  return (
    <textarea
      // [contain:strict] transform-gpu
      className="bg-[image:var(--bg-base64)] bg-[size:var(--bg-size)] w-full h-full outline-none caret-white font-mono bg-no-repeat bg-clip-text text-transparent [image-rendering:pixelated]"
      value={code}
      onChange={e => {
        setCode(e.target.value);

        // if (!highlighter) return;
        // const colors = highlighter
        //   .codeToThemedTokens(e.target.value, "js")
        //   .map(line =>
        //     line.flatMap(token => new Array(token.content.length).fill((token.color || FALLBACK_COLOR).substring(0, 7)))
        //   );

        //  // const height = colors.length;
        // const width = Math.max(...colors.map(row => row.length));
        // const base64 = createPng(colors);

        //  // image.current = { base64, width, height, dirty: true };

        //  // //requestAnimationFrame(() => {
        // //if (image.current.dirty) {
        // image.current.dirty = false;
        // ref.current!.style.setProperty("--bg-base64", `url(${base64})`);
        // ref.current!.style.setProperty("--bg-size", `${width}ch ${height * 1.5}em`);
        // //}
        // //});
      }}
      ref={ref}
      spellCheck={false}
    />
  );
}
