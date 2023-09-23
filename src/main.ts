import Prism, { type Token } from "prismjs";
import "prismjs/components/prism-javascript";
import "./style.css";

/**
 * Init code
 */
const code = `function add(a, b) {
  return a + b;
}

const x = add(1, 2);`;

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

const canvas = document.createElement("canvas");
//canvas.style.visibility = "hidden";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("No context");

const javascript = Prism.languages["javascript"];

/**
 * Editor Binding
 */
const editor = document.querySelector<HTMLTextAreaElement>("#editor");
if (!editor) throw new Error("Could not find editor");
editor.textContent = code;

setBgImage(editor);

editor.addEventListener("input", function (event) {
  setBgImage(event.target as HTMLTextAreaElement);
});

type Token = [length: number, color: string];
type Line = Token[];

function setBgImage(editor: HTMLTextAreaElement) {
  const value = editor.value;
  const tokens = Prism.tokenize(value, javascript);
  const lines: Line[] = [];

  let currentLine: Line = [];
  lines.push(currentLine);

  function pushTokens(tokens: ReturnType<typeof Prism.tokenize>) {
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
  }

  pushTokens(tokens);

  console.log(lines);
}

/**
 * Color Magic
 */
/* function getPixels(lines: [length: number, color: string][]) {
  canvas.width = Math.max(...lines.map(row => row.length));
  canvas.height = lines.length;

  for (let y = 0; y < lines.length; ++y) {
    for (let x = 0; x < lines[y].length; ++x) {
      for (let z = 0; z < (lines[y][x][0] as number); ++z) {
        ctx!.fillStyle = lines[y][x][1] as string;
        ctx!.fillRect(x, y, 1, 1);
      }
    }
  }

  return canvas.toDataURL("image/png");
} */

/* function getColor(token: string | Token): [length: number, color: string, content: string][] {
  if (typeof token === "string") {
    return [[token.length, theme.get("string") || "#FF00FF", token]];
  }

  if (typeof token.content === "string") {
    return [[token.length, theme.get(token.type) || "#FF00FF", token.content]];
  }

  if (!theme.has(token.type)) {
    if (Array.isArray(token.content)) {
      return token.content.flatMap(getColor);
    } else {
      console.warn("missing", token.type, token.content);
    }
  }

  throw new Error("?");
} */

/* function getColors(source: string) {
  const language = "javascript";
  return Prism.tokenize(source, Prism.languages[language]).flatMap(getColor);
} */
