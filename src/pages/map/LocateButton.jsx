import React from 'react';
import { MapControl, ControlPosition, useMap } from '@vis.gl/react-google-maps';
import './LocateButton.scss';

/**
 * Map control button that centers the map on the user's current position.
 * Renders nothing when geolocation is unavailable.
 * @param {Object} props
 * @param {{latitude: number, longitude: number}|null} props.location - The
 * user's current position, or null when it could not be resolved.
 */
function LocateButton({ location }) {
    const map = useMap();

    if (!location) {
        return null;
    }

    /**
     * Pans the map to the user's position, zooming in first when the map
     * is zoomed out further than city level.
     */
    const handleClick = () => {
        if (!map) {
            return;
        }

        if (map.getZoom() < 11) {
            map.setZoom(11);
        }
        map.panTo({ lat: location.latitude, lng: location.longitude });
    };

    return (
        <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <button
                type="button"
                className="locate-button"
                aria-label="Center map on your location"
                title="Center map on your location"
                onClick={handleClick}>
                <i className="fas fa-crosshairs" aria-hidden="true"></i>
            </button>
        </MapControl>
    );
}

export default LocateButton;
