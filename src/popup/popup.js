document.addEventListener('DOMContentLoaded', () => {
    const enabledCheckbox = document.getElementById('enabled');
    const youtubeCheckbox = document.getElementById('youtube');
    const instagramCheckbox = document.getElementById('instagram');

    // Load settings
    chrome.storage.sync.get(['enabled', 'youtube', 'instagram'], (result) => {
        enabledCheckbox.checked = result.enabled !== false;
        youtubeCheckbox.checked = result.youtube !== false;
        instagramCheckbox.checked = result.instagram !== false;
    });

    // Save settings
    enabledCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ enabled: enabledCheckbox.checked });
    });

    youtubeCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ youtube: youtubeCheckbox.checked });
    });

    instagramCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ instagram: instagramCheckbox.checked });
    });
});
