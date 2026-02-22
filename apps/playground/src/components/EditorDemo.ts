import { attachTextarea, oneDarkTheme } from "high-perf-syntax-highlighter";

export function mountEditorDemo(): void {
  const editor = document.querySelector<HTMLTextAreaElement>("#editor");
  if (!editor) {
    return;
  }

  attachTextarea(editor, {
    language: "javascript",
    theme: oneDarkTheme,
    debounce: "microtask"
  });
}
