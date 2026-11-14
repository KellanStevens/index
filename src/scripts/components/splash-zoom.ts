// The exit of the splash screen: zoom through the name.
//
// The SVG #splash-knockout (SplashScreen.astro) is a copy of the sheet with the
// name cut out of it by a mask. This script puts the copy exactly on the HTML
// sheet and name, swaps them, and scales the name of the copy up around a point
// inside the stem of an "l", until the opening of that stem covers the screen.
// Only the transform of vector text changes, so each frame is drawn sharp.

// Font size of the glyph that is drawn on a canvas to find the stem, in px.
const RASTER_PX = 240;
// The zoom ends at this many times the scale at which the stem covers the
// screen. The opening is then past the screen edges before the last fade.
const OVERSHOOT = 2.4;
const MIN_SCALE = 40;
const MAX_SCALE = 320;
// The clock of the zoom runs slow at first: progress = time ^ ACCELERATION.
const ACCELERATION = 2.3;

interface Opening {
    /** Centre of the opening, in px from the left of the glyph and from its baseline. */
    x: number;
    y: number;
    /** Half of the width and of the height of the stroke at that point, in px. */
    halfWidth: number;
    halfHeight: number;
}

/** Finds the widest part of the strokes of a glyph: the place to zoom through. */
function findOpening(glyph: string, fontFamily: string, fontSize: number) {
    const size = RASTER_PX;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;

    // The glyph starts at originX and stands on the line originY.
    const originX = size / 2;
    const originY = size * 1.5;
    context.font = `${size}px ${fontFamily}`;
    context.fillText(glyph, originX, originY);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const ink = (x: number, y: number) =>
        pixels[(y * canvas.width + x) * 4 + 3] > 127;

    // The longest run of ink in the rows through the x-height.
    let best = { length: 0, x: originX, y: Math.round(size * 1.15) };
    for (let y = Math.round(size * 0.9); y < size * 1.4; y += 4) {
        let run = 0;
        for (let x = 0; x <= canvas.width; x++) {
            if (x < canvas.width && ink(x, y)) {
                run++;
                continue;
            }
            if (run > best.length) best = { length: run, x: x - run / 2, y };
            run = 0;
        }
    }
    if (best.length === 0) return null;

    // The extent of the stroke up and down from there, then left and right
    // from the middle of that.
    const column = Math.round(best.x);
    let top = best.y;
    let bottom = best.y;
    while (top > 0 && ink(column, top - 1)) top--;
    while (bottom < canvas.height - 1 && ink(column, bottom + 1)) bottom++;
    const row = Math.round((top + bottom) / 2);
    let left = column;
    let right = column;
    while (left > 0 && ink(left - 1, row)) left--;
    while (right < canvas.width - 1 && ink(right + 1, row)) right++;

    const scale = fontSize / size;
    const opening: Opening = {
        x: ((left + right) / 2 - originX) * scale,
        y: ((top + bottom) / 2 - originY) * scale,
        halfWidth: Math.max(1, ((right - left) / 2) * scale),
        halfHeight: Math.max(1, ((bottom - top) / 2) * scale),
    };
    return opening;
}

/**
 * Plays the exit on the splash screen and calls `done` when the page is clear.
 * The letters must be still and in the font of the name.
 */
export function zoomThrough(splash: HTMLElement, done: () => void) {
    const svg = splash.querySelector<SVGSVGElement>('#splash-knockout');
    const heading = splash.querySelector<HTMLElement>('.splash-text');
    // The invisible copy of each letter is the one that is in the text flow.
    const letters = heading
        ? [...heading.querySelectorAll<HTMLElement>('.invisible')]
        : [];
    if (!svg || !heading || letters.length === 0) {
        done();
        return;
    }

    // 1. Measure the HTML name. All reads of the layout come before any write.
    const width = splash.clientWidth;
    const height = splash.clientHeight;
    const headingStyle = getComputedStyle(heading);
    const fontSize = parseFloat(headingStyle.fontSize);
    const fontFamily = headingStyle.fontFamily;
    const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );
    const splashStyle = getComputedStyle(splash);
    const cells = [
        ['#splash-grid-minor', '--grid-cell'],
        ['#splash-grid-major', '--grid-major-cell'],
    ].map(([selector, property]) => ({
        selector,
        // The grid tokens are in rem (global.css).
        size: parseFloat(splashStyle.getPropertyValue(property)) * rootFontSize,
    }));
    // The production build minifies the token from "1150ms" to "1.15s", so
    // the unit has to be read too.
    const durationToken = splashStyle.getPropertyValue('--splash-zoom-ms').trim();
    const durationValue = parseFloat(durationToken);
    const duration =
        (durationToken.endsWith('ms') ? durationValue : durationValue * 1000) ||
        1150;

    // A box of no size sits on the baseline of the text.
    const probe = document.createElement('i');
    probe.style.cssText = 'display:inline-block;width:0;height:0';
    letters[0].append(probe);
    const baseline = probe.getBoundingClientRect().bottom;
    probe.remove();
    const lefts = letters.map((letter) => letter.getBoundingClientRect().left);
    const glyphs = letters.map((letter) => letter.textContent ?? '');

    // 2. Zoom through the "l" nearest the centre, or the middle letter.
    const fromCentre = (i: number) => Math.abs(lefts[i] - width / 2);
    const candidates = glyphs.flatMap((glyph, i) => (glyph === 'l' ? [i] : []));
    const target =
        candidates.length > 0
            ? candidates.reduce((a, b) => (fromCentre(a) < fromCentre(b) ? a : b))
            : Math.floor(letters.length / 2);
    const opening = findOpening(glyphs[target], fontFamily, fontSize);
    if (!opening) {
        done();
        return;
    }
    const originX = lefts[target] + opening.x;
    const originY = baseline + opening.y;
    // The scale at which the opening covers the whole screen.
    const cover = Math.max(
        Math.max(originX, width - originX) / opening.halfWidth,
        Math.max(originY, height - originY) / opening.halfHeight
    );
    const endScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, cover * OVERSHOOT)
    );

    // 3. Put the SVG copy exactly on the HTML sheet and name.
    const setSize = (element: Element) => {
        element.setAttribute('width', String(width));
        element.setAttribute('height', String(height));
    };
    svg.querySelectorAll('.splash-full').forEach(setSize);
    const mask = svg.querySelector('mask');
    if (mask) {
        mask.setAttribute('x', '0');
        mask.setAttribute('y', '0');
        setSize(mask);
    }
    svg.querySelectorAll('text').forEach((text) => {
        text.textContent = glyphs.join('');
        text.setAttribute('x', lefts.map((x) => x.toFixed(2)).join(' '));
        text.setAttribute('y', baseline.toFixed(2));
        text.setAttribute('font-size', String(fontSize));
        text.style.fontFamily = fontFamily;
    });
    // The same grid as .bp-grid: a line on the top and on the left of each
    // cell, with a line on the horizontal centre of the screen.
    for (const { selector, size } of cells) {
        const pattern = svg.querySelector(selector);
        if (!pattern || !(size > 0)) continue;
        pattern.setAttribute('x', String(width / 2));
        pattern.setAttribute('y', '0');
        pattern.setAttribute('width', String(size));
        pattern.setAttribute('height', String(size));
        pattern
            .querySelector('path')
            ?.setAttribute('d', `M0 0H${size}V1H1V${size}H0Z`);
    }

    // 4. Swap and zoom. The fades in splash-screen.css start on this frame too.
    const zoomed = svg.querySelectorAll('.splash-zoom');
    splash.classList.add('is-zooming');
    const start = performance.now();
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        done();
    };
    // A hidden tab gets no frames. Finish anyway.
    setTimeout(finish, duration + 80);

    const frame = (now: number) => {
        if (finished) return;
        const time = Math.min(1, Math.max(0, (now - start) / duration));
        // An exponential zoom has a constant apparent speed.
        const scale = Math.pow(endScale, Math.pow(time, ACCELERATION));
        const transform = `translate(${originX} ${originY}) scale(${scale}) translate(${-originX} ${-originY})`;
        zoomed.forEach((group) => group.setAttribute('transform', transform));
        if (time < 1) requestAnimationFrame(frame);
        else finish();
    };
    requestAnimationFrame(frame);
}
