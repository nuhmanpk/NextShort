import { BaseScroller } from './base-scroller.js';
import { log } from '../utils/dom.js';

export class InstagramScroller extends BaseScroller {
    constructor() {
        super();
        this.isExplorePage = false;
    }

    init() {
        // Detect if we're on explore page or regular reels
        this.detectPageType();
        super.init();
    }

    detectPageType() {
        const path = window.location.pathname;
        // Explore page URLs: /explore, /p/, /reel/ (single reel view)
        // Regular reels feed: /reels
        this.isExplorePage = path.includes('/explore') || path.includes('/p/') || (path.includes('/reel/') && !path.startsWith('/reels'));
        log(`Instagram page type: ${this.isExplorePage ? 'Explore/Single Reel' : 'Reels Feed'}`);
    }

    getCurrentVideo() {
        // Instagram Reels are usually <video> inside <main>
        // We need to find the one that is currently in view
        const videos = Array.from(document.querySelectorAll('main video, article video, div[role="dialog"] video'));

        // Find the video that is centered in the viewport
        const centerVideo = videos.find(video => {
            const rect = video.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const videoCenter = rect.top + (rect.height / 2);

            // Check if video center is close to viewport center (with some tolerance)
            const viewportCenter = viewportHeight / 2;
            return Math.abs(videoCenter - viewportCenter) < 200; // 200px tolerance
        });

        return centerVideo || null;
    }

    scrollToNext() {
        // Re-detect page type on each scroll since Instagram is an SPA
        // and user might navigate between explore and reels
        this.detectPageType();
        this.incrementStats('instagram');

        // If we're on explore page or single reel view, click the Next button
        if (this.isExplorePage) {
            this.clickNextButton();
            return;
        }

        // Otherwise, use the regular scroll behavior for reels feed
        log('Using scroll navigation for reels feed');
        const current = this.getCurrentVideo();
        if (!current) {
            log('No current video found for scrolling');
            return;
        }

        const videos = Array.from(document.querySelectorAll('main video'));
        const currentIndex = videos.indexOf(current);

        if (currentIndex !== -1 && currentIndex < videos.length - 1) {
            const nextVideo = videos[currentIndex + 1];
            log('Scrolling to next video', nextVideo);
            nextVideo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            log('No next video found to scroll to.');
            // Fallback: Trigger ArrowDown which Insta might handle to fetch more
            const event = new KeyboardEvent('keydown', {
                key: 'ArrowDown',
                code: 'ArrowDown',
                keyCode: 40,
                which: 40,
                bubbles: true
            });
            document.body.dispatchEvent(event);
        }
    }

    clickNextButton() {
        // Try to find the Next button using the provided structure
        // Look for button with class _abl- containing the rotated SVG
        const nextButtons = Array.from(document.querySelectorAll('button._abl-'));

        for (const button of nextButtons) {
            // Check if this button contains the "Next" SVG
            const svg = button.querySelector('svg[aria-label="Next"]');
            if (svg) {
                log('Clicking Next button on explore page');
                button.click();
                return;
            }
        }

        // Fallback: Try to find by SVG title
        const nextSvg = document.querySelector('svg title');
        if (nextSvg && nextSvg.textContent === 'Next') {
            const button = nextSvg.closest('button');
            if (button) {
                log('Clicking Next button (found via SVG title)');
                button.click();
                return;
            }
        }

        // Additional fallback: Arrow key
        log('Next button not found, using ArrowDown key');
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            code: 'ArrowDown',
            keyCode: 40,
            which: 40,
            bubbles: true
        });
        document.body.dispatchEvent(event);
    }
}
