function initFooter() {
    function fitText() {
        const text = document.getElementById('footer-name');
        if (!text) return;

        text.style.width = 'max-content';
        text.style.fontSize = '100px';

        const intrinsicWidth = text.getBoundingClientRect().width;
        const targetWidth = window.innerWidth - 24;
        const newFontSize = (targetWidth / intrinsicWidth) * 100;

        text.style.fontSize = `${Math.floor(newFontSize * 100) / 100}px`;
        text.style.width = 'auto';
    }

    fitText();
    window.addEventListener('resize', fitText);

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
            const randomFont =
                fonts[Math.floor(Math.random() * fonts.length)];
            letter.style.fontFamily = randomFont;
        });

        letter.addEventListener('mouseleave', () => {
            letter.style.fontFamily = '';
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
} else {
    initFooter();
}
