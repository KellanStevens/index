/**
 * Turns the photos in src/images/ into the 1-bit PNGs in src/images/dithered/.
 * Run it with `bun run dither` after you add or change a photo, and commit
 * the result.
 *
 * Each PNG holds one dot per pixel. The page shows it at a whole multiple of
 * its size with `image-rendering: pixelated`, so the dots stay sharp.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import jpeg from 'jpeg-js';
import {
    atkinson,
    sharpen,
    shrinkGrey,
    tone,
    type Region,
} from '../src/lib/dither';
import { encodeBitmapPng } from './png';

interface Job {
    /** A JPEG in src/images/. */
    source: string;
    /** Size of the output in dots. */
    width: number;
    height: number;
    /** Part of the source to keep. Defaults to all of it. */
    crop?: Region;
    /** Above 1 lightens the midtones, below 1 darkens them. */
    gamma?: number;
    /** Contrast around mid grey. 1 leaves it as it is. */
    contrast?: number;
    /** How much to sharpen before dithering. */
    sharpness?: number;
}

const jobs: Job[] = [
    {
        source: 'kellan.jpeg',
        width: 192,
        height: 256,
        crop: { left: 121, top: 76, width: 270, height: 360 },
        contrast: 0.85,
        sharpness: 0.3,
    },
    { source: 'graduation.jpeg', width: 288, height: 256, gamma: 1.15 },
    { source: 'tillo.jpeg', width: 56, height: 56 },
    { source: 'indie-hackers.jpeg', width: 56, height: 56 },
    { source: 'tripco.jpeg', width: 56, height: 56 },
    { source: 'thames-systems.jpeg', width: 56, height: 56, gamma: 0.45 },
    { source: 'wethinkcode.jpg', width: 56, height: 56 },
];

const imagesDir = path.join(import.meta.dir, '../src/images');
const outDir = path.join(imagesDir, 'dithered');

await mkdir(outDir, { recursive: true });

for (const job of jobs) {
    const { source, width, height, gamma, contrast, sharpness = 0.8 } = job;

    const decoded = jpeg.decode(await readFile(path.join(imagesDir, source)), {
        useTArray: true,
    });
    const crop = job.crop ?? {
        left: 0,
        top: 0,
        width: decoded.width,
        height: decoded.height,
    };

    // Rec. 709 luma of each RGBA pixel.
    const grey = new Float32Array(decoded.width * decoded.height);
    for (let i = 0; i < grey.length; i++) {
        grey[i] =
            0.2126 * decoded.data[i * 4] +
            0.7152 * decoded.data[i * 4 + 1] +
            0.0722 * decoded.data[i * 4 + 2];
    }

    const small = shrinkGrey(grey, decoded.width, crop, width, height);
    const prepared = sharpen(
        tone(small, { gamma, contrast }),
        width,
        height,
        sharpness
    );

    const name = `${path.parse(source).name}.png`;
    await writeFile(
        path.join(outDir, name),
        encodeBitmapPng(atkinson(prepared, width, height), width, height)
    );
    console.log(`${source} -> dithered/${name} (${width}x${height})`);
}
