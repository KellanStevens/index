(function () {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches;
    const shouldBeDark =
        stored === 'dark' || (stored !== 'light' && prefersDark);
    if (shouldBeDark) {
        document.documentElement.classList.add('dark');
    }
})();
