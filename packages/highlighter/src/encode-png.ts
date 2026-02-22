import { deflateSync } from "node:zlib";
import type { PixelEncoder } from "./types.ts";

const crc32Table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[n] = c >>> 0;
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crc32Table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(4 + 4 + data.length + 4);
  const view = new DataView(out.buffer);

  view.setUint32(0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);

  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));

  return out;
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

export const encodePng: PixelEncoder = (
  buf: Uint8Array,
  width: number,
  height: number,
): string => {
  // IHDR: width(4) + height(4) + bitDepth(1) + colorType(1) + compression(1) + filter(1) + interlace(1)
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8;   // 8 bits per channel
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0;  // deflate compression
  ihdr[11] = 0;  // adaptive filtering
  ihdr[12] = 0;  // no interlace

  // Raw scanlines: each row = [filter_byte(0), ...RGBA pixels]
  const rowLen = 1 + width * 4;
  const raw = new Uint8Array(height * rowLen);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // filter type None
    raw.set(
      buf.subarray(y * width * 4, (y + 1) * width * 4),
      y * rowLen + 1,
    );
  }

  const compressed = deflateSync(raw);

  const ihdrChunk = chunk("IHDR", ihdr);
  const idatChunk = chunk(
    "IDAT",
    new Uint8Array(compressed.buffer, compressed.byteOffset, compressed.byteLength),
  );
  const iendChunk = chunk("IEND", new Uint8Array(0));

  const png = new Uint8Array(
    PNG_SIGNATURE.length + ihdrChunk.length + idatChunk.length + iendChunk.length,
  );
  let offset = 0;
  png.set(PNG_SIGNATURE, offset); offset += PNG_SIGNATURE.length;
  png.set(ihdrChunk, offset);     offset += ihdrChunk.length;
  png.set(idatChunk, offset);     offset += idatChunk.length;
  png.set(iendChunk, offset);

  return "data:image/png;base64," + Buffer.from(png).toString("base64");
};
