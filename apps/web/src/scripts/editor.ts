import { getBackground } from "highlighter-core";

const img = new Image();
const editor = document.querySelector("#editor");

if (!(editor instanceof HTMLTextAreaElement)) {
  throw new Error("Editor element is missing.");
}

img.addEventListener("load", () => {
  requestAnimationFrame(() => {
    editor.style.backgroundImage = `url(${img.src})`;
    editor.style.backgroundSize = img.dataset.size ?? "";
  });
});

const updateBgImage = () => {
  const { image, size } = getBackground(editor.value);
  img.dataset.size = size;
  img.src = image;
};

updateBgImage();
editor.addEventListener("input", () => queueMicrotask(updateBgImage));
