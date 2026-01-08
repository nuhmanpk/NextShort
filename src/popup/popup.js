// Storage keys
const STORAGE_KEYS = {
    enabled: 'enabled',
    youtube: 'youtube',
    instagram: 'instagram',
    scrollTiming: 'scrollTiming',
    dailyLimit: 'dailyLimit',
    dailyLimitEnabled: 'dailyLimitEnabled',
    autoPause: 'autoPause',
    stats: 'stats',
    sessionStart: 'sessionStart'
};

// DOM Elements
let elements = {};
let sessionInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    await loadSettings();
    setupEventListeners();
    checkScriptStatus();
    startSessionTimer();
    updateStats();
});

// Initialize DOM elements
function initializeElements() {
    elements = {
        // Status
        statusPill: document.getElementById('statusPill'),
        statusText: document.getElementById('statusText'),

        // Stats
        videoCount: document.getElementById('videoCount'),
        sessionTime: document.getElementById('sessionTime'),
        youtubeCount: document.getElementById('youtubeCount'),
        instagramCount: document.getElementById('instagramCount'),

        // Toggles
        enabled: document.getElementById('enabled'),
        youtube: document.getElementById('youtube'),
        instagram: document.getElementById('instagram'),
        autoPause: document.getElementById('autoPause'),
        dailyLimitEnabled: document.getElementById('dailyLimitEnabled'),

        // Sliders
        scrollTiming: document.getElementById('scrollTiming'),
        scrollTimingValue: document.getElementById('scrollTimingValue'),
        dailyLimit: document.getElementById('dailyLimit'),
        dailyLimitValue: document.getElementById('dailyLimitValue'),

        // Actions
        reloadBtn: document.getElementById('reloadBtn'),
        resetStatsBtn: document.getElementById('resetStatsBtn'),
        actionsSection: document.getElementById('actionsSection'),

        // Cards
        youtubeCard: document.getElementById('youtubeCard'),
        instagramCard: document.getElementById('instagramCard')
    };
}

// Load settings from storage
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(Object.values(STORAGE_KEYS), (result) => {
            // Main toggles
            elements.enabled.checked = result.enabled !== false;
            elements.youtube.checked = result.youtube !== false;
            elements.instagram.checked = result.instagram !== false;
            elements.autoPause.checked = result.autoPause === true;

            // Scroll timing
            const scrollTiming = result.scrollTiming || 99;
            elements.scrollTiming.value = scrollTiming;
            elements.scrollTimingValue.textContent = `${scrollTiming}%`;

            // Daily limit
            elements.dailyLimitEnabled.checked = result.dailyLimitEnabled === true;
            const dailyLimit = result.dailyLimit || 100;
            elements.dailyLimit.value = dailyLimit;
            elements.dailyLimit.disabled = !result.dailyLimitEnabled;
            updateDailyLimitValue(dailyLimit, result.dailyLimitEnabled);

            resolve();
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Main toggles
    elements.enabled.addEventListener('change', () => {
        saveSetting(STORAGE_KEYS.enabled, elements.enabled.checked);
        updateStatus();
    });

    elements.youtube.addEventListener('change', () => {
        saveSetting(STORAGE_KEYS.youtube, elements.youtube.checked);
    });

    elements.instagram.addEventListener('change', () => {
        saveSetting(STORAGE_KEYS.instagram, elements.instagram.checked);
    });

    elements.autoPause.addEventListener('change', () => {
        saveSetting(STORAGE_KEYS.autoPause, elements.autoPause.checked);
    });

    // Scroll timing slider
    elements.scrollTiming.addEventListener('input', (e) => {
        const value = e.target.value;
        elements.scrollTimingValue.textContent = `${value}%`;
    });

    elements.scrollTiming.addEventListener('change', (e) => {
        saveSetting(STORAGE_KEYS.scrollTiming, parseInt(e.target.value));
    });

    // Daily limit
    elements.dailyLimitEnabled.addEventListener('change', () => {
        const enabled = elements.dailyLimitEnabled.checked;
        elements.dailyLimit.disabled = !enabled;
        saveSetting(STORAGE_KEYS.dailyLimitEnabled, enabled);
        updateDailyLimitValue(elements.dailyLimit.value, enabled);
    });

    elements.dailyLimit.addEventListener('input', (e) => {
        updateDailyLimitValue(e.target.value, elements.dailyLimitEnabled.checked);
    });

    elements.dailyLimit.addEventListener('change', (e) => {
        saveSetting(STORAGE_KEYS.dailyLimit, parseInt(e.target.value));
    });

    // Actions
    elements.reloadBtn.addEventListener('click', reloadAndInject);
    elements.resetStatsBtn.addEventListener('click', resetStats);
}

// Save setting to storage
function saveSetting(key, value) {
    chrome.storage.sync.set({ [key]: value });
}

// Update daily limit display
function updateDailyLimitValue(value, enabled) {
    if (enabled) {
        elements.dailyLimitValue.textContent = `${value} videos`;
    } else {
        elements.dailyLimitValue.textContent = 'Off';
    }
}

// Check script injection status
async function checkScriptStatus() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url) {
            updateStatusPill('inactive', 'Not on supported site');
            return;
        }

        const url = tab.url;
        const isYoutube = url.includes('youtube.com/shorts');
        const isInstagram = url.includes('instagram.com') &&
            (url.includes('/reels') || url.includes('/explore') || url.includes('/p/') || url.includes('/reel/'));

        if (!isYoutube && !isInstagram) {
            updateStatusPill('inactive', 'Not on supported site');
            elements.actionsSection.style.display = 'none';
            return;
        }

        // Check if script is actually running
        chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
            if (chrome.runtime.lastError || !response) {
                updateStatusPill('warning', 'Extension not loaded');
                elements.actionsSection.style.display = 'block';
            } else {
                const platform = isYoutube ? 'YouTube Shorts' : 'Instagram';
                updateStatusPill('active', `Active on ${platform}`);
                elements.actionsSection.style.display = 'none';
            }
        });
    } catch (error) {
        updateStatusPill('inactive', 'Unable to check status');
    }
}

// Update status pill
function updateStatusPill(status, text) {
    elements.statusPill.className = `status-pill ${status}`;
    elements.statusText.textContent = text;
}

// Update status based on enabled state
function updateStatus() {
    if (elements.enabled.checked) {
        checkScriptStatus();
    } else {
        updateStatusPill('inactive', 'Extension disabled');
    }
}

// Reload tab and inject script
async function reloadAndInject() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            elements.reloadBtn.textContent = '🔄 Reloading...';
            elements.reloadBtn.disabled = true;

            chrome.tabs.reload(tab.id, {}, () => {
                setTimeout(() => {
                    elements.reloadBtn.textContent = '✓ Reloaded!';
                    setTimeout(() => {
                        elements.reloadBtn.textContent = '🔄 Reload & Inject Script';
                        elements.reloadBtn.disabled = false;
                        checkScriptStatus();
                    }, 1500);
                }, 1000);
            });
        }
    } catch (error) {
        console.error('Error reloading tab:', error);
    }
}

// Session timer
function startSessionTimer() {
    // Get or create session start time
    chrome.storage.local.get([STORAGE_KEYS.sessionStart], (result) => {
        let sessionStart = result.sessionStart;

        if (!sessionStart) {
            sessionStart = Date.now();
            chrome.storage.local.set({ [STORAGE_KEYS.sessionStart]: sessionStart });
        }

        // Update timer every second
        sessionInterval = setInterval(() => {
            const elapsed = Date.now() - sessionStart;
            const minutes = Math.floor(elapsed / 60000);
            const hours = Math.floor(minutes / 60);

            if (hours > 0) {
                elements.sessionTime.textContent = `${hours}h ${minutes % 60}m`;
            } else {
                elements.sessionTime.textContent = `${minutes}m`;
            }
        }, 1000);
    });
}

// Update stats
function updateStats() {
    chrome.storage.local.get([STORAGE_KEYS.stats], (result) => {
        const stats = result.stats || {
            total: 0,
            youtube: 0,
            instagram: 0,
            lastReset: Date.now()
        };

        // Check if we need to reset daily stats
        const today = new Date().toDateString();
        const lastReset = new Date(stats.lastReset).toDateString();

        if (today !== lastReset) {
            stats.total = 0;
            stats.youtube = 0;
            stats.instagram = 0;
            stats.lastReset = Date.now();
            chrome.storage.local.set({ [STORAGE_KEYS.stats]: stats });
        }

        // Update UI
        elements.videoCount.textContent = stats.total || 0;
        elements.youtubeCount.textContent = `${stats.youtube || 0} today`;
        elements.instagramCount.textContent = `${stats.instagram || 0} today`;
    });

    // Refresh stats every 5 seconds
    setTimeout(updateStats, 5000);
}

// Reset stats
function resetStats() {
    if (confirm('Reset all statistics? This cannot be undone.')) {
        const stats = {
            total: 0,
            youtube: 0,
            instagram: 0,
            lastReset: Date.now()
        };

        chrome.storage.local.set({
            [STORAGE_KEYS.stats]: stats,
            [STORAGE_KEYS.sessionStart]: Date.now()
        }, () => {
            updateStats();
            elements.sessionTime.textContent = '0m';
        });
    }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'videoScrolled') {
        updateStats();
    }
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (sessionInterval) {
        clearInterval(sessionInterval);
    }
});
