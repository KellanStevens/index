/**
 * 1-bit dithering. Everything here is pure, so that the image script
 * (`scripts/dither.ts`) and the components that draw dithered bands share it.
 */

/**
 * The Bayer threshold matrix of `size` × `size`, where `size` is a power of
 * two. Each value from 0 to size² - 1 appears once.
 */
export function bayerMatrix(size: number): number[][] {
    if (size < 1 || (size & (size - 1)) !== 0) {
        throw new RangeError(`Bayer size must be a power of two, got ${size}`);
    }

    let matrix = [[0]];
    while (matrix.length < size) {
        const n = matrix.length;
        const next = Array.from({ length: n * 2 }, () =>
            Array.from<number>({ length: n * 2 }).fill(0)
        );
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const v = matrix[y][x] * 4;
                next[y][x] = v;
                next[y][x + n] = v + 2;
                next[y + n][x] = v + 3;
                next[y + n][x + n] = v + 1;
            }
        }
        matrix = next;
    }
    return matrix;
}

/**
 * Atkinson error diffusion. Takes 8-bit grey pixels in row order and returns
 * one byte per pixel: 0 for ink, 255 for paper.
 *
 * Atkinson spreads only three quarters of the error, so highlights and
 * shadows clip to clean paper and ink instead of filling with noise.
 */
export function atkinson(
    grey: ArrayLike<number>,
    width: number,
    height: number
): Uint8Array {
    if (grey.length !== width * height) {
        throw new RangeError(
            `Expected ${width * height} pixels, got ${grey.length}`
        );
    }

    const work = Float32Array.from(grey);
    const out = new Uint8Array(width * height);
    const spread = (x: number, y: number, error: number) => {
        if (x >= 0 && x < width && y < height) work[y * width + x] += error;
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const value = work[i] < 128 ? 0 : 255;
            out[i] = value;

            const error = (work[i] - value) / 8;
            spread(x + 1, y, error);
            spread(x + 2, y, error);
            spread(x - 1, y + 1, error);
            spread(x, y + 1, error);
            spread(x + 1, y + 1, error);
            spread(x, y + 2, error);
        }
    }
    return out;
}

/**
 * An SVG path for a band that fades from paper at the top to ink at the
 * bottom with ordered dithering. Each cell is one unit square, so the path
 * fits a `0 0 cols rows` view box. Because the Bayer matrix repeats, a band
 * whose `cols` is a multiple of `size` tiles sideways.
 */
export function bayerFadePath(cols: number, rows: number, size = 8): string {
    const matrix = bayerMatrix(size);
    const levels = size * size;
    let path = '';

    for (let y = 0; y < rows; y++) {
        const density = (y + 1) / rows;
        let runStart = -1;
        for (let x = 0; x <= cols; x++) {
            const ink =
                x < cols &&
                density > (matrix[y % size][x % size] + 0.5) / levels;
            if (ink && runStart < 0) runStart = x;
            if (!ink && runStart >= 0) {
                path += `M${runStart} ${y}h${x - runStart}v1H${runStart}z`;
                runStart = -1;
            }
        }
    }
    return path;
}

/** A rectangle of an image, in pixels. */
export interface Region {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * Scales a region of 8-bit grey pixels down to `width` × `height` by
 * averaging the source pixels under each output pixel.
 */
export function shrinkGrey(
    grey: ArrayLike<number>,
    sourceWidth: number,
    region: Region,
    width: number,
    height: number
): Float32Array {
    const out = new Float32Array(width * height);
    const scaleX = region.width / width;
    const scaleY = region.height / height;

    for (let y = 0; y < height; y++) {
        const y0 = region.top + y * scaleY;
        const y1 = y0 + scaleY;
        for (let x = 0; x < width; x++) {
            const x0 = region.left + x * scaleX;
            const x1 = x0 + scaleX;

            let sum = 0;
            let area = 0;
            // Stop at the edge of the region: rounding can push y1 and x1 past it.
            const yEnd = Math.min(y1, region.top + region.height);
            const xEnd = Math.min(x1, region.left + region.width);
            for (let sy = Math.floor(y0); sy < yEnd; sy++) {
                const coverY = Math.min(sy + 1, y1) - Math.max(sy, y0);
                for (let sx = Math.floor(x0); sx < xEnd; sx++) {
                    const cover =
                        coverY * (Math.min(sx + 1, x1) - Math.max(sx, x0));
                    sum += grey[sy * sourceWidth + sx] * cover;
                    area += cover;
                }
            }
            out[y * width + x] = sum / area;
        }
    }
    return out;
}

/**
 * Stretches the pixels so that the darkest become 0 and the lightest 255,
 * ignoring the most extreme `clip` share at each end, then applies gamma
 * (above 1 lightens the midtones) and contrast around mid grey.
 */
export function tone(
    grey: Float32Array,
    { clip = 0.01, gamma = 1, contrast = 1 } = {}
): Float32Array {
    const sorted = grey.toSorted();
    const low = sorted[Math.floor((sorted.length - 1) * clip)];
    const high = sorted[Math.ceil((sorted.length - 1) * (1 - clip))];
    const range = high - low || 1;

    return grey.map((value) => {
        const stretched = Math.max(0, Math.min(1, (value - low) / range));
        const lifted = 255 * stretched ** (1 / gamma);
        return Math.max(0, Math.min(255, (lifted - 128) * contrast + 128));
    });
}

/**
 * Sharpens by pushing each pixel away from the mean of its four neighbours.
 * A small image needs this before it is dithered, or its edges dissolve.
 */
export function sharpen(
    grey: Float32Array,
    width: number,
    height: number,
    amount: number
): Float32Array {
    const at = (x: number, y: number) =>
        grey[
            Math.max(0, Math.min(height - 1, y)) * width +
                Math.max(0, Math.min(width - 1, x))
        ];

    return grey.map((value, i) => {
        const x = i % width;
        const y = (i - x) / width;
        const around =
            (at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1)) / 4;
        return Math.max(0, Math.min(255, value + (value - around) * amount));
    });
}
