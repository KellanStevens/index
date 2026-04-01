function initFontHover() {
    const letters = document.querySelectorAll<HTMLElement>('.hover-letter');
    const fonts = [
        'Impact, sans-serif',
        'Bradley Hand, cursive',
        'Brush Script MT, cursive',
        'Luminari, fantasy',
        'Pilowlava',
        '"Sirin Stencil"',
    ];

    letters.forEach((letter) => {
        letter.addEventListener('mouseenter', () => {
            const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
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
