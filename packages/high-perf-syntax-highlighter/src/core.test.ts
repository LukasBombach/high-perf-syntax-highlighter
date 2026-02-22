import { describe, expect, it } from "vitest";
import {
  defaultFallbackColor,
  getBackgroundSize,
  renderToRgbaBuffer,
  tokenizeToLines
} from "./core";

describe("tokenizeToLines", () => {
  it("tokenizes multiline code and computes width/height", () => {
    const result = tokenizeToLines("const a = 1;\nlet bc = 2;");

    expect(result.height).toBe(2);
    expect(result.width).toBe(12);
  });

  it("uses fallback color for unknown theme entries", () => {
    const result = tokenizeToLines("const value = 1;", {
      theme: { default: [255, 255, 255, 255] },
      fallbackColor: defaultFallbackColor
    });

    const firstLine = result.lines[0] ?? [];
    const [firstToken] = firstLine;
    expect(firstToken).toBeDefined();
    expect(firstToken?.[1]).toEqual(defaultFallbackColor);
  });
});

describe("renderToRgbaBuffer", () => {
  it("creates a pixel buffer with expected dimensions", () => {
    const rendered = renderToRgbaBuffer({
      code: "let x = 42;"
    });

    const safeWidth = Math.max(1, rendered.width);
    const safeHeight = Math.max(1, rendered.height);

    expect(rendered.width).toBe(11);
    expect(rendered.height).toBe(1);
    expect(rendered.buffer.length).toBe(safeWidth * safeHeight * 4);
  });

  it("computes background size", () => {
    expect(getBackgroundSize(11, 2, 1.5)).toBe("11ch 3em");
  });
});
