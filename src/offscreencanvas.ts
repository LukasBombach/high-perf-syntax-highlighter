import Prism from "prismjs";
import "prismjs/components/prism-javascript";

type Token = [length: number, color: string];
type Line = Token[];

const javascript = Prism.languages["javascript"];
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

const theme = new Map([
  ["atrule", "#c678dd"],
  ["attr-value", "#98c379"],
  ["boolean", "#d19a66"],
  ["builtin", "#98c379"],
  ["cdata", "#5C6370"],
  ["char", "#98c379"],
  ["comment", "#5C6370"],
  ["constant", "#d19a66"],
  ["deleted", "#d19a66"],
  ["doctype", "#5C6370"],
  ["entity", "#56b6c2"],
  ["function", "#61afef"],
  ["important", "#c678dd"],
  ["inserted", "#98c379"],
  ["keyword", "#c678dd"],
  ["number", "#d19a66"],
  ["operator", "#56b6c2"],
  ["prolog", "#5C6370"],
  ["property", "#d19a66"],
  ["punctuation", "#abb2bf"],
  ["regex", "#c678dd"],
  ["selector", "#e06c75"],
  ["string", "#98c379"],
  ["symbol", "#d19a66"],
  ["tag", "#e06c75"],
  ["url", "#56b6c2"],
  ["variable", "#c678dd"],
]);

onmessage = evt => {
  if (typeof evt.data.code === "string") {
    pixels(evt.data.code);
  } else if (evt.data.canvas) {
    canvas = evt.data.canvas as HTMLCanvasElement;
    ctx = canvas.getContext("2d");
  }
};

function pixels(code: string) {
  if (!canvas) throw new Error("No canvas");
  if (!ctx) throw new Error("No context");

  console.log("pixels");
  console.log(code);

  const tokens = Prism.tokenize(code, javascript);
  const lines: Line[] = [];

  let currentLine: Line = [];
  lines.push(currentLine);

  (function pushTokens(tokens: ReturnType<typeof Prism.tokenize>) {
    tokens.forEach(token => {
      if (typeof token === "string") {
        const splitLines = token.split("\n");

        for (let i = 0; i < splitLines.length - 1; i++) {
          currentLine.push([splitLines[i].length, theme.get("string") ?? "#FF00FF"]);
          currentLine = [];
          lines.push(currentLine);
        }
        currentLine.push([splitLines[splitLines.length - 1].length, theme.get("string") ?? "#FF00FF"]);
      } else if (Array.isArray(token)) {
        pushTokens(token);
      } else {
        currentLine.push([token.length, theme.get(token.type) ?? "#FF00FF"]);
      }
    });
  })(tokens);

  const width = Math.max(...lines.map(row => row.reduce((acc, [length]) => acc + length, 0)));
  const height = lines.length;

  canvas.width = width;
  canvas.height = height;

  for (let y = 0; y < lines.length; ++y) {
    let x = 0;
    for (const [length, color] of lines[y]) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, length, 1);
      x += length;
    }
  }

  postMessage({
    //backgroundImage: `url(${canvas.toDataURL()})`,
    backgroundSize: `${width}ch ${height * 1.5}em`,
  });

  /* requestAnimationFrame(() => {
    editor.style.backgroundImage =;
    editor.style.backgroundSize = ;
  }); */
}
