import { zoomThrough } from '@/scripts/components/splash-zoom';
import { displayFonts, webDisplayFonts } from '@/scripts/ui/fonts';

// The shuffle is a wave in two passes, both from the left. First the letters
// start to change font one at a time, START_STEP_MS apart, each one every
// FLIP_MS. When the last letter has started, the letters settle on the font of
// the name one at a time, SETTLE_STEP_MS apart. The exit starts at EXIT_MS and
// copies the name as it is then, so the whole name must be still before that:
// with six letters, the last one settles at 1.83s.
const FLIP_MS = 120;
const START_STEP_MS = 150;
const SETTLE_STEP_MS = 180;
const EXIT_MS = 2800;
const FADE_MS = 300;

function shuffleFonts(splash: HTMLElement) {
    const letters = [...splash.querySelectorAll<HTMLElement>('.splash-letter')];
    const lastFont = letters.map(() => -1);
    const settled = letters.map(() => false);
    // The first letter settles one step after the last letter has started.
    const settleStart = (letters.length - 1) * START_STEP_MS + SETTLE_STEP_MS;
    const start = performance.now();

    const flip = () => {
        const elapsed = performance.now() - start;

        letters.forEach((letter, i) => {
            if (settled[i]) return;

            if (elapsed < i * START_STEP_MS) return;

            if (elapsed >= settleStart + i * SETTLE_STEP_MS) {
                settled[i] = true;
                letter.style.fontFamily = '';
                return;
            }

            // Never the same font twice in a row, so every flip shows.
            let next = Math.floor(Math.random() * (displayFonts.length - 1));
            if (next >= lastFont[i]) next += 1;
            lastFont[i] = next;
            letter.style.fontFamily = displayFonts[next];
        });

        if (settled.every(Boolean)) clearInterval(timer);
    };

    const timer = setInterval(flip, FLIP_MS);
    flip();
}

function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!reducedMotion) {
        // The web fonts download only when a letter first uses them. Ask for
        // them now, so that the first flips do not show a fallback font.
        for (const font of webDisplayFonts) {
            void document.fonts.load(`1em ${font}`);
        }
        shuffleFonts(splash);
    }

    setTimeout(() => {
        const remove = () => splash.remove();
        splash.classList.add('is-exiting');

        if (reducedMotion) {
            splash.classList.add('is-fading');
            setTimeout(remove, FADE_MS);
        } else {
            zoomThrough(splash, remove);
        }
    }, EXIT_MS);
}

initSplashScreen();
