import type { PixelEncoder } from "./types.ts";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

export const encodeCanvas: PixelEncoder = (
  buf: Uint8Array,
  width: number,
  height: number,
): string => {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const clamped = new Uint8ClampedArray(buf.length);
  clamped.set(buf);
  const imageData = new ImageData(clamped, width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};
