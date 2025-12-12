# NextShort 🚀

<div align="center">
    <img src="icons/icon128.png" width="300" height="300">
    
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support%20my%20work-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/nuhmanpk)
</div>

    


**NextShort** is a Chrome extension that automatically scrolls to the next video on YouTube Shorts and Instagram Reels when the current one ends.

Designed for hands-free viewing, this extension detects the end of a video (by removing the default loop behavior) and smoothly scrolls to the next item in the feed.

## Features ✨

- **YouTube Shorts Support**: Automatically plays the next short.
- **Instagram Reels Support**: Automatically plays the next reel.
- **Toggle Controls**: Enable/Disable globally or per site via a simple popup.
- **Smart Detection**: Detects navigation between pages (SPA support).

## Installation 🛠️

### From Source (Developer Mode)

1.  Clone this repository:
    ```bash
    git clone https://github.com/nuhmanpk/NextShort.git
    ```
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the `NextShort` directory.

## Usage 📖

1.  Open YouTube Shorts or Instagram Reels.
2.  The extension automatically engages.
3.  When a video finishes, it will scroll to the next one!
4.  Click the extension icon in the toolbar to toggle settings.

## How it Works 🧠

NextShort uses a lightweight content script that observes video elements on the page.
- It removes the `loop` attribute from the video tag, allowing the `ended` event to fire.
- It listens for the `ended` event.
- When fired, it triggers a click on the "Next" button (YouTube) or scrolls the next video into view (Instagram).

## Contributing 🤝

Contributions are welcome! Please open an issue or submit a pull request.

## License 📄

MIT License
