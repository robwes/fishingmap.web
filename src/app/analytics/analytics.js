import { getCookiePreferences, saveCookiePreferences } from '@/app/cookies/cookiePreferences';

export const MEASUREMENT_ID = 'G-YPGFQ4JQB2';
const DISABLE_KEY = `ga-disable-${MEASUREMENT_ID}`;
let initialized = false;

/** Read a visitor's saved choice; unavailable storage means no consent. */
export function getAnalyticsConsent() {
    const preferences = getCookiePreferences();
    return preferences ? (preferences.analytics ? 'granted' : 'denied') : null;
}

/** Enable collection only in production on the public site. */
export function isAnalyticsEnabled() {
    return import.meta.env.PROD && ['fishingmap.fi', 'www.fishingmap.fi'].includes(window.location.hostname);
}

/**
 * Apply consent before loading the Google tag. Enhanced measurement handles
 * browser-history page views; do not also send React route page-view events.
 * @param {'granted'|'denied'|null} choice Visitor's analytics choice.
 */
export function applyAnalyticsConsent(choice) {
    const granted = choice === 'granted' && isAnalyticsEnabled();
    window[DISABLE_KEY] = !granted;
    if (!granted) {
        if (initialized) {
            window.gtag('consent', 'update', { analytics_storage: 'denied' });
            clearAnalyticsCookies();
        }
        return;
    }

    if (initialized) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
        return;
    }

    initialized = true;
    window.dataLayer = window.dataLayer || [];
    /** Queue Google tag commands until its async script has loaded.
     * @param {...*} args Google tag command and parameters.
     */
    window.gtag = function () {
        window.dataLayer.push(arguments);
    };
    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_domain: window.location.hostname,
        cookie_path: '/',
    });
    const script = document.createElement('script');
    script.id = 'google-analytics';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
}

/** Remove GA cookies on withdrawal without touching authentication cookies. */
function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (name === '_ga' || name.startsWith('_ga_')) {
            const expired = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = `${expired}; domain=${window.location.hostname}`;
            document.cookie = expired;
        }
    }
}

/**
 * Save and apply a choice, still respecting it if browser storage is blocked.
 * @param {'granted'|'denied'} choice Visitor's analytics choice.
 */
export function saveAnalyticsConsent(choice) {
    saveCookiePreferences({ analytics: choice === 'granted' });
    applyAnalyticsConsent(choice);
}
