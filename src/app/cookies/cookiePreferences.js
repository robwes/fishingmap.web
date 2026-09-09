export const COOKIE_PREFERENCES_KEY = 'cookiePreferences';
// Increment when adding a category or changing a purpose so visitors can choose again.
const PREFERENCES_VERSION = 1;

/** Read the current cookie choices; missing or outdated choices need a new prompt. */
export function getCookiePreferences() {
    try {
        const saved = JSON.parse(localStorage.getItem(COOKIE_PREFERENCES_KEY));
        if (saved?.version === PREFERENCES_VERSION && typeof saved.categories?.analytics === 'boolean') {
            return saved.categories;
        }
    } catch {
        // Unavailable storage or malformed preferences must not grant consent.
    }
    return null;
}

/**
 * Remember choices for the cookie categories currently offered by the site.
 * @param {{analytics: boolean}} categories Optional cookie preferences.
 */
export function saveCookiePreferences(categories) {
    try {
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
            version: PREFERENCES_VERSION,
            categories,
        }));
    } catch {
        // The caller can still apply these choices for the current page.
    }
}
