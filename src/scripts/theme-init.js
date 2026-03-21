(function () {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var shouldBeDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    if (shouldBeDark) {
        document.documentElement.classList.add('dark');
    }
})();
