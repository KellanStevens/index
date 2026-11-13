// Opens the detail sheet of a timeline block on a click, or after the pointer
// has rested on the block for HOVER_MS. The line that draws across the top of
// the block (.bp-detail-trigger in global.css) takes the same time.
const HOVER_MS = 1000;
// After a sheet closes, the pointer is often on a block again. Ignore that.
const REOPEN_GUARD_MS = 600;

function initDetailSheets() {
    const canHover = window.matchMedia('(hover: hover)').matches;
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    let lastClosed = 0;

    const open = (dialog: HTMLDialogElement) => {
        clearTimeout(hoverTimer);
        if (!dialog.open) dialog.showModal();
    };

    document
        .querySelectorAll<HTMLElement>('[data-detail]')
        .forEach((trigger) => {
            const dialog = document.getElementById(trigger.dataset.detail ?? '');
            if (!(dialog instanceof HTMLDialogElement)) return;

            trigger.addEventListener('click', () => {
                // A drag that selects text is not a click on the block.
                if (window.getSelection()?.toString()) return;
                open(dialog);
            });

            if (canHover) {
                trigger.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimer);
                    if (Date.now() - lastClosed < REOPEN_GUARD_MS) return;
                    hoverTimer = setTimeout(() => open(dialog), HOVER_MS);
                });
                trigger.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimer);
                });
            }

            // A click on the backdrop lands on the dialog element itself.
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) dialog.close();
            });
            dialog.addEventListener('close', () => {
                lastClosed = Date.now();
            });
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailSheets);
} else {
    initDetailSheets();
}
