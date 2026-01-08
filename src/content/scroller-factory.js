import { YoutubeScroller } from './youtube.js';
import { InstagramScroller } from './instagram.js';
import { log } from '../utils/dom.js';

(async function main() {
    log('Checking location for ShortScroll...');
    const hostname = window.location.hostname;

    // Check settings
    const settings = await chrome.storage.sync.get(['enabled', 'youtube', 'instagram']);

    // Defaults
    const isEnabled = settings.enabled !== false; // default true
    const isYoutubeEnabled = settings.youtube !== false; // default true
    const isInstagramEnabled = settings.instagram !== false; // default true

    if (!isEnabled) {
        log('Extension disabled in settings.');
        return;
    }

    let scroller = null;

    if (hostname.includes('youtube.com') && isYoutubeEnabled) {
        if (window.location.pathname.startsWith('/shorts')) {
            scroller = new YoutubeScroller();
        }
    } else if (hostname.includes('instagram.com') && isInstagramEnabled) {
        // Activate on: /reels feed, /explore, /p/ (posts), /reel/ (single reel)
        const path = window.location.pathname;
        const isReelsPage = path.includes('/reels/') || path.startsWith('/reels');
        const isExplorePage = path.includes('/explore') || path.includes('/p/') || (path.includes('/reel/') && !path.startsWith('/reels'));

        if (isReelsPage || isExplorePage) {
            scroller = new InstagramScroller();
        }
    }

    if (scroller) {
        scroller.init();

        // Also listen for navigation changes (SPA support)
        let lastUrl = window.location.href;
        new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                log('URL changed, re-evaluating scroller...');
                // Simple re-check for now
                // A more robust solution might separate URL checking from scroller instantiation
                // but since `BaseScroller` constantly loops effectively once started, 
                // we mainly need to ensure it STARTS if we navigated INTO a shorts page from elsewhere.
                if (hostname.includes('youtube.com') && window.location.pathname.startsWith('/shorts') && !scroller.isRunning) {
                    scroller.start();
                }
            }
        }).observe(document, { subtree: true, childList: true });
    } else {
        log('No suitable scroller found for this page.');
        // SPA Check for YouTube: We might land on Home then click Shorts
        if (hostname.includes('youtube.com')) {
            const observer = new MutationObserver(() => {
                if (window.location.pathname.startsWith('/shorts')) {
                    log('Navigated to Shorts, initializing scroller.');
                    scroller = new YoutubeScroller();
                    scroller.init();
                    observer.disconnect();
                }
            });
            observer.observe(document, { subtree: true, childList: true });
        }
    }
})().catch(err => {
    console.error('[ShortScroll] Fatal error in scroller factory:', err);
});
