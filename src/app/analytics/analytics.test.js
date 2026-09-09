// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let analytics;

beforeEach(async () => {
    window.happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
    vi.resetModules();
    vi.stubEnv('PROD', true);
    vi.stubGlobal('location', new URL('https://fishingmap.fi/species'));
    localStorage.clear();
    document.getElementById('google-analytics')?.remove();
    delete window.dataLayer;
    delete window.gtag;
    analytics = await import('./analytics');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('analytics consent', () => {
    it('does not load the tag or queue events before consent or after rejection', () => {
        analytics.applyAnalyticsConsent(null);
        analytics.saveAnalyticsConsent('denied');
        expect(document.getElementById('google-analytics')).toBeNull();
        expect(window.dataLayer).toBeUndefined();
        expect(analytics.getAnalyticsConsent()).toBe('denied');
        expect(window['ga-disable-G-YPGFQ4JQB2']).toBe(true);
    });

    it('loads once after consent, with advertising denied before configuration', () => {
        analytics.saveAnalyticsConsent('granted');
        analytics.applyAnalyticsConsent('granted');
        expect(document.querySelectorAll('#google-analytics')).toHaveLength(1);
        expect(document.getElementById('google-analytics').src).toBe('https://www.googletagmanager.com/gtag/js?id=G-YPGFQ4JQB2');
        const commands = window.dataLayer.map((command) => Array.from(command));
        expect(commands[0]).toEqual(['consent', 'default', {
            analytics_storage: 'denied', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied',
        }]);
        expect(commands.filter(([command]) => command === 'config')).toHaveLength(1);
        expect(analytics.getAnalyticsConsent()).toBe('granted');
    });

    it('disables collection and removes analytics cookies when consent is withdrawn', () => {
        analytics.saveAnalyticsConsent('granted');
        document.cookie = '_ga=test; path=/';
        document.cookie = 'session=keep; path=/';
        analytics.saveAnalyticsConsent('denied');
        expect(window['ga-disable-G-YPGFQ4JQB2']).toBe(true);
        expect(document.cookie).not.toContain('_ga=');
        expect(document.cookie).toContain('session=keep');
        expect(analytics.getAnalyticsConsent()).toBe('denied');
    });

    it('excludes development builds and non-production hosts even with consent', () => {
        vi.stubEnv('PROD', false);
        analytics.applyAnalyticsConsent('granted');
        expect(window.dataLayer).toBeUndefined();
        vi.stubEnv('PROD', true);
        vi.stubGlobal('location', new URL('http://localhost:3000/'));
        analytics.applyAnalyticsConsent('granted');
        expect(window.dataLayer).toBeUndefined();
    });

    it('defaults to no consent when storage is unavailable', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
        expect(analytics.getAnalyticsConsent()).toBeNull();
    });

    it('does not grant analytics from outdated or malformed cookie preferences', () => {
        for (const saved of ['broken json', JSON.stringify({ version: 0, categories: { analytics: true } }),
            JSON.stringify({ version: 1, categories: { analytics: 'true' } })]) {
            localStorage.setItem('cookiePreferences', saved);
            expect(analytics.getAnalyticsConsent()).toBeNull();
            analytics.applyAnalyticsConsent(analytics.getAnalyticsConsent());
            expect(window.dataLayer).toBeUndefined();
        }
    });
});
