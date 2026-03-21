function initSplashScreen() {
    const splash = document.getElementById('splash-screen');

    if (splash) {
        setTimeout(() => {
            splash.remove();
        }, 4300);
    }
}

initSplashScreen();
