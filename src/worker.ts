import Prism from "prismjs";
import "prismjs/components/prism-javascript";

const javascript = Prism.languages["javascript"];

const canvas = new OffscreenCanvas(100, 100);
const ctx = canvas.getContext("2d");

type Token = [length: number, color: string];
type Line = Token[];

function getBgImage(editor: HTMLTextAreaElement) {
  if (!ctx) throw new Error("No context");

  const value = editor.value;
  const tokens = Prism.tokenize(value, javascript);
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

  requestAnimationFrame(() => {
    editor.style.backgroundImage = `url(${canvas.toDataURL()})`;
    editor.style.backgroundSize = `${width}ch ${height * 1.5}em`;
  });
}

onmessage = e => {
  console.log("Message received from main script");
  const tokens = Prism.tokenize(e.data, javascript);
  postMessage(tokens);
};
