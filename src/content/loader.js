(async () => {
    try {
        const src = chrome.runtime.getURL('src/content/scroller-factory.js');
        await import(src);
    } catch (e) {
        // console.error('[NextShort] Error loading main script:', e);
    }
})();
