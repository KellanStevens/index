// Shows the current time in a time zone, for example "20:18:42 GMT+2", in
// each element with data-clock="<IANA time zone>". Updates every second.
function initClocks() {
    document.querySelectorAll<HTMLElement>('[data-clock]').forEach((clock) => {
        let format: Intl.DateTimeFormat;
        try {
            format = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: clock.dataset.clock,
                timeZoneName: 'shortOffset',
            });
        } catch {
            // An old browser without shortOffset keeps the placeholder.
            return;
        }

        const tick = () => {
            clock.textContent = format.format(new Date());
        };

        tick();
        setInterval(tick, 1000);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClocks);
} else {
    initClocks();
}
