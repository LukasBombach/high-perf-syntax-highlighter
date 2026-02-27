import { attachTextarea, oneDarkTheme } from "high-perf-syntax-highlighter";

let teardown: (() => void) | null = null;

export function mountEditorDemo(): void {
  teardown?.();

  const editor = document.querySelector<HTMLTextAreaElement>("#editor");
  if (!editor) {
    return;
  }

  const highlighter = attachTextarea(editor, {
    language: "javascript",
    theme: oneDarkTheme,
    debounce: "microtask"
  });

  teardown = highlighter.detach;
}
