import React, { useEffect, useRef, useState } from 'react';
import { applyAnalyticsConsent, getAnalyticsConsent, saveAnalyticsConsent } from '@/app/analytics/analytics';
import { COOKIE_PREFERENCES_KEY } from './cookiePreferences';
import './CookieConsent.scss';

/** Present cookie preferences and keep them available in the footer. */
function CookieConsent() {
    const [choice, setChoice] = useState(getAnalyticsConsent);
    const [isOpen, setIsOpen] = useState(choice === null);
    const settingsButton = useRef(null);
    const rejectButton = useRef(null);
    const openedFromSettings = useRef(false);

    useEffect(() => {
        applyAnalyticsConsent(choice);
    }, [choice]);

    useEffect(() => {
        /** Respect a preference changed or cleared in another tab.
         * @param {StorageEvent} event Browser storage change.
         */
        const syncChoice = (event) => {
            if (event.key === COOKIE_PREFERENCES_KEY || event.key === null) {
                setChoice(getAnalyticsConsent());
            }
        };
        window.addEventListener('storage', syncChoice);
        return () => window.removeEventListener('storage', syncChoice);
    }, []);

    useEffect(() => {
        if (isOpen && openedFromSettings.current) {
            rejectButton.current?.focus();
        }
    }, [isOpen]);

    /**
     * Remember a visitor's choice and dismiss the prompt.
     * @param {'granted'|'denied'} nextChoice Selected analytics preference.
     */
    const choose = (nextChoice) => {
        saveAnalyticsConsent(nextChoice);
        setChoice(nextChoice);
        setIsOpen(false);
        if (openedFromSettings.current) {
            settingsButton.current?.focus();
        }
    };

    /** Reopen the choice from the persistent footer control. */
    const openSettings = () => {
        openedFromSettings.current = true;
        setIsOpen(true);
    };

    return (
        <>
            <button ref={settingsButton} type="button" className="cookie-settings" onClick={openSettings}
                aria-expanded={isOpen} aria-controls="cookie-consent">
                Cookie settings
            </button>
            {isOpen && (
                <section id="cookie-consent" className="cookie-consent" aria-labelledby="cookie-consent-title">
                    <div className="cookie-consent-copy">
                        <h2 id="cookie-consent-title">We use cookies</h2>
                        <p>We use necessary cookies to make the site work. With your permission, we also use
                            analytics cookies to understand how the site is used. You can change your choice
                            at any time in Cookie settings.</p>
                        <details>
                            <summary>Cookie details</summary>
                            <p><strong>Necessary — always active.</strong> Support features such as signing in.
                                We also store your cookie preferences on this device.</p>
                            <p><strong>Analytics — optional.</strong> Google Analytics measures visits and site usage
                                and shares usage data with Google. Rejecting optional cookies keeps analytics off.</p>
                            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
                                How Google uses this data
                            </a>
                        </details>
                    </div>
                    <div className="cookie-consent-actions">
                        <button ref={rejectButton} type="button" onClick={() => choose('denied')}>Reject optional</button>
                        <button type="button" onClick={() => choose('granted')}>Accept all cookies</button>
                    </div>
                </section>
            )}
        </>
    );
}

export default CookieConsent;
