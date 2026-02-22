import type { Line } from "./types.ts";

export function fillPixelBuffer(
  lines: Line[],
  width: number,
  height: number,
): Uint8Array {
  const buf = new Uint8Array(width * height * 4);

  for (let y = 0; y < lines.length; ++y) {
    let x = 0;
    for (const [length, [r, g, b, a]] of lines[y]) {
      for (let i = 0; i < length; ++i) {
        const off = (y * width + x + i) * 4;
        buf[off] = r;
        buf[off + 1] = g;
        buf[off + 2] = b;
        buf[off + 3] = a;
      }
      x += length;
    }
  }

  return buf;
}
