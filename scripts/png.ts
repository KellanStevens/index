import { crc32, deflateSync } from 'node:zlib';

function chunk(type: string, data: Uint8Array): Buffer {
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);
    return out;
}

/**
 * Encodes a 1-bit greyscale PNG. `pixels` holds one byte per pixel in row
 * order: 0 is black, anything else is white.
 */
export function encodeBitmapPng(
    pixels: Uint8Array,
    width: number,
    height: number
): Buffer {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 1; // bit depth
    header[9] = 0; // colour type: greyscale

    // Each row is a filter byte (0, none) and then the pixels, eight to a byte.
    const stride = 1 + Math.ceil(width / 8);
    const rows = Buffer.alloc(stride * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (pixels[y * width + x]) {
                rows[y * stride + 1 + (x >> 3)] |= 0x80 >> (x & 7);
            }
        }
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(rows, { level: 9 })),
        chunk('IEND', new Uint8Array(0)),
    ]);
}
