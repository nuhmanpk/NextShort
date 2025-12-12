chrome.runtime.onInstalled.addListener(() => {
    // Set default settings
    chrome.storage.sync.get(['enabled', 'youtube', 'instagram'], (result) => {
        if (result.enabled === undefined) {
            chrome.storage.sync.set({ enabled: true });
        }
        if (result.youtube === undefined) {
            chrome.storage.sync.set({ youtube: true });
        }
        if (result.instagram === undefined) {
            chrome.storage.sync.set({ instagram: true });
        }
    });
    console.log('NextShort installed and settings initialized.');
});
