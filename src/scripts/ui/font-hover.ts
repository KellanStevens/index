import { displayFonts } from '@/scripts/ui/fonts';

function initFontHover() {
    const letters = document.querySelectorAll<HTMLElement>('.hover-letter');

    letters.forEach((letter) => {
        letter.addEventListener('mouseenter', () => {
            const randomFont =
                displayFonts[Math.floor(Math.random() * displayFonts.length)];
            letter.style.fontFamily = randomFont;
        });

        letter.addEventListener('mouseleave', () => {
            letter.style.fontFamily = '';
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFontHover);
} else {
    initFontHover();
}
