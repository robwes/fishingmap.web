import React from 'react';
import CookieConsent from '@/app/cookies/CookieConsent';
import './Footer.scss';

function Footer() {
    return (
        <footer className='footer'>
            <span className="footer-brand">Fishing Map</span>
            <span className="footer-dot" aria-hidden="true"></span>
            <span className="footer-year">2026</span>
            <CookieConsent />
        </footer>
    )
}

export default Footer
