import React from 'react';
import './LocationImagePlaceholder.scss';

/**
 * Default image tile shown for a location that has no uploaded photo: a
 * primary-blue background with a white water icon. Fills its container, so
 * the parent controls the size (list card figure, map info window, ...).
 */
function LocationImagePlaceholder() {
    return (
        <div className="location-image-placeholder">
            <i className="fas fa-water" aria-hidden="true" />
        </div>
    );
}

export default LocationImagePlaceholder;
