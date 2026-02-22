export type Rgba = [r: number, g: number, b: number, a: number];
export type Token = [length: number, color: Rgba];
export type Line = Token[];

export interface EncodeResult {
  dataUrl: string;
  backgroundSize: string;
}

export type PixelEncoder = (
  buf: Uint8Array,
  width: number,
  height: number,
) => string;
