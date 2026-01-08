import { BaseScroller } from './base-scroller.js';
import { log } from '../utils/dom.js';

export class YoutubeScroller extends BaseScroller {
    constructor() {
        super();
        this.processedUrls = new Set();
        this.boundHandleTimeUpdate = null;
    }

    getCurrentVideo() {
        // Try multiple selectors in order of reliability
        let video = document.querySelector('ytd-reel-video-renderer[is-active] video');

        if (!video) {
            // Try the shorts player selector
            video = document.querySelector('#shorts-player video');
        }

        if (!video) {
            // Fallback to finding videos in viewport
            const videos = Array.from(document.querySelectorAll('ytd-reel-video-renderer video, #shorts-player video'));
            video = videos.find(v => {
                const rect = v.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const videoCenter = rect.top + (rect.height / 2);
                return Math.abs(videoCenter - viewportCenter) < 150;
            });
        }

        return video || null;
    }

    attachListeners(video) {
        // Call parent to set up base listeners
        super.attachListeners(video);

        // Clean up old listener if it exists
        if (this.boundHandleTimeUpdate && this.currentVideo) {
            this.currentVideo.removeEventListener('timeupdate', this.boundHandleTimeUpdate);
        }

        // Create new bound handler
        this.boundHandleTimeUpdate = this.handleTimeUpdate.bind(this);
        video.addEventListener('timeupdate', this.boundHandleTimeUpdate);

        log('Listeners attached to video');
    }

    cleanupListeners(video) {
        // Call parent cleanup first
        super.cleanupListeners(video);

        // Clean up timeupdate listener
        if (this.boundHandleTimeUpdate && video) {
            video.removeEventListener('timeupdate', this.boundHandleTimeUpdate);
        }
    }

    handleTimeUpdate(e) {
        const video = e.target;

        // Get the current video URL from the page
        const currentUrl = window.location.href;

        // If we've already processed this URL, skip
        if (this.processedUrls.has(currentUrl)) {
            return;
        }

        // Check progress
        if (video.duration > 0) {
            const percentage = (video.currentTime / video.duration) * 100;
            if (percentage >= 99) {
                log(`Video reached 99% (${percentage.toFixed(1)}%), scrolling to next...`);
                this.processedUrls.add(currentUrl);
                this.incrementStats('youtube');
                this.scrollToNext();
            }
        }
    }

    scrollToNext() {
        // Try the down navigation button first
        const nextButton = document.querySelector('#navigation-button-down > ytd-button-renderer > yt-button-shape > button');
        if (nextButton) {
            log('Clicking next button (navigation-button-down)');
            nextButton.click();
            return;
        }

        // Try alternative selectors
        const ariaNext = document.querySelector('button[aria-label="Next video"]');
        if (ariaNext) {
            log('Clicking next button (aria-label)');
            ariaNext.click();
            return;
        }

        // Fallback: simulate arrow down key press
        log('Simulating ArrowDown keypress');
        const keyEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            code: 'ArrowDown',
            keyCode: 40,
            which: 40,
            bubbles: true,
            cancelable: true,
            composed: true
        });
        document.body.dispatchEvent(keyEvent);
    }
}
