/**
 * Helper to wait for an element to appear in the DOM.
 * @param {string} selector 
 * @param {number} timeout 
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Helper to log messages with a prefix.
 * @param {string} message 
 * @param {any} data 
 */
export function log(message, data = null) {
    // const prefix = "[NextShort]";
    // if (data) {
    //   console.log(`${prefix} ${message}`, data);
    // } else {
    //   console.log(`${prefix} ${message}`);
    // }
}
