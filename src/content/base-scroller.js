import { log } from '../utils/dom.js';

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
