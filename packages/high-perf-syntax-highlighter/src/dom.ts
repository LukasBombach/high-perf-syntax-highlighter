import { renderToDataUrl, type RenderInput, type Theme } from "./core";

export interface AttachOptions {
  language?: string;
  theme?: Theme;
  fallbackColor?: RenderInput["fallbackColor"];
  lineHeightEm?: number;
  debounce?: "microtask" | "raf";
  img?: HTMLImageElement;
  canvas?: HTMLCanvasElement;
}

export interface AttachedHighlighter {
  detach: () => void;
  update: () => void;
}

export function attachTextarea(textarea: HTMLTextAreaElement, options: AttachOptions = {}): AttachedHighlighter {
  const img = options.img ?? new Image();
  const canvas = options.canvas ?? document.createElement("canvas");
  const debounce = options.debounce ?? "microtask";

  let disposed = false;
  let pending = false;

  const applyBackground = () => {
    if (disposed) {
      return;
    }
    requestAnimationFrame(() => {
      if (disposed) {
        return;
      }
      textarea.style.backgroundImage = `url(${img.src})`;
      textarea.style.backgroundSize = img.dataset.size ?? "";
      textarea.dataset.hpshReady = "true";
    });
  };

  const update = () => {
    if (disposed) {
      return;
    }

    const rendered = renderToDataUrl({
      code: textarea.value,
      language: options.language,
      theme: options.theme,
      fallbackColor: options.fallbackColor,
      lineHeightEm: options.lineHeightEm,
      canvas
    });

    img.dataset.size = rendered.backgroundSize;
    img.src = rendered.dataUrl;
  };

  const scheduleUpdate = () => {
    if (pending || disposed) {
      return;
    }
    pending = true;

    const flush = () => {
      pending = false;
      update();
    };

    if (debounce === "raf") {
      requestAnimationFrame(flush);
      return;
    }

    queueMicrotask(flush);
  };

  const handleInput = () => {
    scheduleUpdate();
  };

  img.addEventListener("load", applyBackground);
  textarea.addEventListener("input", handleInput);
  update();

  return {
    detach: () => {
      disposed = true;
      textarea.removeEventListener("input", handleInput);
      img.removeEventListener("load", applyBackground);
      delete textarea.dataset.hpshReady;
    },
    update
  };
}
