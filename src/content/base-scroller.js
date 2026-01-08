import { log } from '../utils/dom.js';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
        sendResponse({ status: 'ok' });
    }
    return true;
});


export class BaseScroller {
    constructor() {
        this.isRunning = false;
        this.currentVideo = null;
        this.observer = null;
    }

    init() {
        log('Initializing scroller...');
        this.start();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        log('Scroller started.');
        this.loop();
    }

    stop() {
        this.isRunning = false;
        log('Scroller stopped.');
        if (this.currentVideo) {
            this.cleanupListeners(this.currentVideo);
            this.currentVideo = null;
        }
    }

    loop() {
        if (!this.isRunning) return;

        // derived classes method
        const video = this.getCurrentVideo();

        if (video && video !== this.currentVideo) {
            log('New video detected.', video);

            // Clean up old video listeners
            if (this.currentVideo) {
                this.cleanupListeners(this.currentVideo);
            }

            this.attachListeners(video);
            this.currentVideo = video;
        }

        // Check again in a bit (polling is simple and effective for this)
        // A MutationObserver could be more efficient but video elements logic 
        // can be complex with dynamic loading.
        requestAnimationFrame(() => this.loop());
    }

    attachListeners(video) {
        // Remove the loop attribute so the 'ended' event fires
        if (video.hasAttribute('loop')) {
            video.removeAttribute('loop');
        }
        // Also set the property just in case
        video.loop = false;

        // Store bound handler for cleanup
        this.boundHandleEnded = this.handleEnded.bind(this);
        video.addEventListener('ended', this.boundHandleEnded);
    }

    cleanupListeners(video) {
        if (!video) return;

        // Remove ended listener if it exists
        if (this.boundHandleEnded) {
            video.removeEventListener('ended', this.boundHandleEnded);
        }

        // Restore loop if needed
        video.loop = true;
    }

    // Helper to increment stats
    async incrementStats(platform) {
        try {
            const result = await chrome.storage.local.get(['stats']);
            const stats = result.stats || {
                total: 0,
                youtube: 0,
                instagram: 0,
                lastReset: Date.now()
            };

            // Check if reset is needed (handled in popup too, but good to have here)
            const today = new Date().toDateString();
            const lastReset = new Date(stats.lastReset).toDateString();
            if (today !== lastReset) {
                stats.total = 0;
                stats.youtube = 0;
                stats.instagram = 0;
                stats.lastReset = Date.now();
            }

            // Increment
            stats.total = (stats.total || 0) + 1;
            stats[platform] = (stats[platform] || 0) + 1;

            // Save
            await chrome.storage.local.set({ stats });
            log(`Stats updated: ${platform} = ${stats[platform]}`);

            // Notify popup if open
            chrome.runtime.sendMessage({ action: 'videoScrolled', stats }).catch(() => {
                // Ignore error if popup is closed
            });
        } catch (e) {
            log('Error updating stats:', e);
        }
    }
    handleEnded() {
        log('Video ended. Scrolling to next...');
        this.scrollToNext();
    }

    // To be implemented by subclasses
    getCurrentVideo() {
        throw new Error('getCurrentVideo() must be implemented');
    }

    scrollToNext() {
        throw new Error('scrollToNext() must be implemented');
    }
}
