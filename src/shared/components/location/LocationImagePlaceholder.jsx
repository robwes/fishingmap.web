import React from 'react';
import './LocationImagePlaceholder.scss';

/**
 * Default image tile shown for a location that has no uploaded photo: a
 * primary-blue background with a white water icon. Fills its container, so
 * the parent controls the size (list card figure, map info window, ...).
 * @param {Object} props
 * @param {boolean} [props.subtle=false] - Render a lighter, smaller variant
 * (tinted background, muted icon) for contexts where the placeholder should
 * recede rather than dominate, e.g. the compact map info window.
 */
function LocationImagePlaceholder({ subtle = false }) {
    return (
        <div className={`location-image-placeholder${subtle ? ' location-image-placeholder--subtle' : ''}`}>
            <i className="fas fa-water" aria-hidden="true" />
        </div>
    );
}

export default LocationImagePlaceholder;
