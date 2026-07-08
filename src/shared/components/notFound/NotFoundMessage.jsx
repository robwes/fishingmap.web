import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundMessage.scss';

/**
 * Friendly fallback for detail pages whose entity failed to load (bad id,
 * removed entity, or unreachable backend), instead of a blank page.
 * @param {{ message: string, linkTo: string, linkText: string }} props
 */
function NotFoundMessage({ message, linkTo, linkText }) {
    return (
        <div className="not-found-message">
            <i className="fas fa-circle-question" aria-hidden="true" />
            <p className="not-found-message-text">{message}</p>
            <Link className="not-found-message-link" to={linkTo}>{linkText}</Link>
        </div>
    );
}

export default NotFoundMessage;
