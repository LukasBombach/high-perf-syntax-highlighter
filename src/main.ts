import { getBackground } from "./highlighter-core";
import "./style.css";

const img = new Image();
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
  const { image, size } = getBackground(editor.value);
  img.dataset.size = size;
  img.src = image;
}
