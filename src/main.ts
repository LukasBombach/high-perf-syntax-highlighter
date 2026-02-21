import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "./style.css";

type Rgba = [r: number, g: number, b: number, a: number];
type Token = [length: number, color: Rgba];
type Line = Token[];

function hex(color: string): Rgba {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}

const theme = new Map<string, Rgba>([
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

const fallbackColor: Rgba = [255, 0, 255, 255];

const img = new Image();
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
const javascript = Prism.languages["javascript"];

const editor = document.querySelector<HTMLTextAreaElement>("#editor")!;

img.addEventListener("load", () => {
  requestAnimationFrame(() => {
    editor.style.backgroundImage = "url(" + img.src + ")";
    editor.style.backgroundSize = img.dataset.size!;
  });
});

updateBgImage(editor);

editor.addEventListener("input", () => {
  queueMicrotask(() => updateBgImage(editor));
});

function updateBgImage(editor: HTMLTextAreaElement) {
  const { image, size } = getBgImage(editor);
  img.dataset.size = size;
  img.src = image;
}

function getBgImage(editor: HTMLTextAreaElement) {
  const { lines, width, height } = getTokens(editor.value);

  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  const buf = imageData.data;

  for (let y = 0; y < lines.length; ++y) {
    let x = 0;
    for (const [length, [r, g, b, a]] of lines[y]) {
      for (let i = 0; i < length; ++i) {
        const off = (y * width + x + i) * 4;
        buf[off] = r;
        buf[off + 1] = g;
        buf[off + 2] = b;
        buf[off + 3] = a;
      }
      x += length;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const image = canvas.toDataURL();
  const size = `${width}ch ${height * 1.5}em`;

  return { image, size };
}

function getTokens(sourcecode: string): { lines: Line[]; width: number; height: number } {
  const tokens = Prism.tokenize(sourcecode, javascript);
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

  const width = Math.max(...lines.map(row => row.reduce((acc, [length]) => acc + length, 0)));
  const height = lines.length;

  return { lines, width, height };
}
