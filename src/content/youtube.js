import { BaseScroller } from './base-scroller.js';
import { log } from '../utils/dom.js';

export class YoutubeScroller extends BaseScroller {
    constructor() {
        super();
        this.scrolledVideos = new WeakSet();
    }

    getCurrentVideo() {
        let video = document.querySelector('ytd-reel-video-renderer[is-active] video');
        if (!video) {
            const videos = Array.from(document.querySelectorAll('ytd-reel-video-renderer video'));
            video = videos.find(v => {
                const rect = v.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const videoCenter = rect.top + (rect.height / 2);
                return Math.abs(videoCenter - viewportCenter) < 100;
            });
        }
        return video || null;
    }

    attachListeners(video) {
        // We override base listener attachment to use timeupdate for precision
        // and to align with "99%" requirement nicely without DOM polling.
        super.attachListeners(video);

        // Remove existing listener if any to prevent duplicates (though Base handles via replacement)
        video.removeEventListener('timeupdate', this.handleTimeUpdate);
        // Bind context
        this.boundHandleTimeUpdate = this.handleTimeUpdate.bind(this);
        video.addEventListener('timeupdate', this.boundHandleTimeUpdate);
    }

    handleTimeUpdate(e) {
        const video = e.target;
        if (this.scrolledVideos.has(video)) return;

        // Check progress
        if (video.duration > 0) {
            const percentage = (video.currentTime / video.duration) * 100;
            if (percentage >= 99) {
                this.scrolledVideos.add(video);
                this.scrollToNext();
            }
        }
    }

    scrollToNext() {
        const nextButton = document.querySelector('#navigation-button-down > ytd-button-renderer > yt-button-shape > button');
        if (nextButton) {
            nextButton.click();
            return;
        }

        const ariaNext = document.querySelector('button[aria-label="Next video"]');
        if (ariaNext) {
            ariaNext.click();
            return;
        }

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
