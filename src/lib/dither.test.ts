import { describe, expect, test } from 'bun:test';
import {
    atkinson,
    bayerFadePath,
    bayerMatrix,
    sharpen,
    shrinkGrey,
    tone,
} from './dither';

describe('bayerMatrix', () => {
    test('builds the 2 × 2 and 4 × 4 matrices', () => {
        expect(bayerMatrix(2)).toEqual([
            [0, 2],
            [3, 1],
        ]);
        expect(bayerMatrix(4)).toEqual([
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5],
        ]);
    });

    test('holds each threshold once', () => {
        const values = bayerMatrix(8).flat();
        expect(values.toSorted((a, b) => a - b)).toEqual(
            Array.from({ length: 64 }, (_, i) => i)
        );
    });

    test('rejects a size that is not a power of two', () => {
        expect(() => bayerMatrix(6)).toThrow(RangeError);
    });
});

describe('atkinson', () => {
    test('keeps black black and white white', () => {
        expect([...atkinson(new Uint8Array(16).fill(0), 4, 4)]).toEqual(
            Array.from({ length: 16 }, () => 0)
        );
        expect([...atkinson(new Uint8Array(16).fill(255), 4, 4)]).toEqual(
            Array.from({ length: 16 }, () => 255)
        );
    });

    test('turns mid grey into a mix of ink and paper', () => {
        const out = atkinson(new Uint8Array(32 * 32).fill(128), 32, 32);
        const paper = out.filter((value) => value === 255).length / out.length;
        expect(paper).toBeGreaterThan(0.4);
        expect(paper).toBeLessThan(0.6);
    });

    test('rejects pixels that do not match the size', () => {
        expect(() => atkinson(new Uint8Array(5), 2, 2)).toThrow(RangeError);
    });
});

// The area of each "M x y h len v1 H x z" run is its length.
const inkOf = (path: string) =>
    [...path.matchAll(/h(\d+)/g)].reduce((sum, m) => sum + Number(m[1]), 0);

describe('bayerFadePath', () => {
    test('covers about half of the band with ink', () => {
        expect(inkOf(bayerFadePath(8, 64)) / (8 * 64)).toBeCloseTo(0.5, 1);
    });

    test('starts with one dot in a tile and ends on solid ink', () => {
        const path = bayerFadePath(8, 64);
        expect(path.startsWith('M0 0h1v1H0zM')).toBe(true);
        expect(path.endsWith('M0 63h8v1H0z')).toBe(true);
    });
});

describe('shrinkGrey', () => {
    test('averages the pixels under each output pixel', () => {
        // prettier-ignore
        const source = [
            0, 100, 10, 30,
            100, 200, 20, 40,
        ];
        const whole = { left: 0, top: 0, width: 4, height: 2 };
        expect([...shrinkGrey(source, 4, whole, 2, 1)]).toEqual([100, 25]);
    });

    test('reads only the region', () => {
        const source = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const corner = { left: 1, top: 1, width: 2, height: 2 };
        expect([...shrinkGrey(source, 3, corner, 1, 1)]).toEqual([7]);
    });

    test('does not read past the edge when the scale is not whole', () => {
        const source = new Uint8Array(200 * 200).fill(90);
        const whole = { left: 0, top: 0, width: 200, height: 200 };
        const out = shrinkGrey(source, 200, whole, 56, 56);
        expect(out.every((value) => Math.abs(value - 90) < 0.001)).toBe(true);
    });
});

describe('tone', () => {
    test('stretches the pixels to the full range', () => {
        const out = tone(Float32Array.of(50, 100, 150), { clip: 0 });
        expect([...out]).toEqual([0, 127.5, 255]);
    });

    test('leaves a flat image flat', () => {
        const out = tone(Float32Array.of(80, 80, 80));
        expect(new Set(out).size).toBe(1);
    });
});

describe('sharpen', () => {
    test('leaves a flat image as it is', () => {
        const flat = new Float32Array(9).fill(120);
        expect([...sharpen(flat, 3, 3, 1)]).toEqual([...flat]);
    });

    test('raises a pixel that is lighter than its neighbours', () => {
        const spot = new Float32Array(9).fill(100);
        spot[4] = 140;
        expect(sharpen(spot, 3, 3, 0.5)[4]).toBe(160);
    });
});
