import { BaseScroller } from './base-scroller.js';
import { log } from '../utils/dom.js';

export class InstagramScroller extends BaseScroller {
    getCurrentVideo() {
        // Instagram Reels are usually <video> inside <main>
        // We need to find the one that is currently in view
        const videos = Array.from(document.querySelectorAll('main video'));

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
        const current = this.getCurrentVideo();
        if (!current) return;

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
}
