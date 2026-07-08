import React, { useEffect, useCallback } from 'react';
import { AdvancedMarker, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import LocationInfoWindow from './LocationInfoWindow';
import markerIcon from '@/assets/images/map_marker.svg';

/**
 * A single location pin on the map. Selection (which controls the info
 * window) is owned by the map page so the sidebar list and the markers stay
 * in sync — clicking a pin toggles it via onSelect.
 * @param {Object} props
 * @param {Object} props.location - Marker-shaped location ({id, name, position, species}).
 * @param {Object} props.clusterer - The shared MarkerClusterer instance.
 * @param {boolean} props.isSelected - Whether this location is the selected one.
 * @param {(id: ?number) => void} props.onSelect - Selects a location id (null clears).
 */
const LocationMarker = ({ location, clusterer, isSelected, onSelect }) => {
    const { latitude, longitude } = location.position;

    const [refCallback, marker] = useAdvancedMarkerRef();

    useEffect(() => {
        if (!clusterer || !marker) {
            return;
        }

        clusterer.addMarker(marker);

        return () => {
            clusterer.removeMarker(marker);
        };
    }, [clusterer, marker]);

    // Clicking the marker toggles its selection (and thus the info window).
    const handleMarkerClick = useCallback(() =>
        onSelect(isSelected ? null : location.id),
        [onSelect, isSelected, location.id]
    );

    // If the maps api closes the info window, clear the selection too.
    const handleClose = useCallback(() => onSelect(null), [onSelect]);

    return (
        <>
            <AdvancedMarker
                key={location.id}
                position={{ lat: latitude, lng: longitude }}
                onClick={handleMarkerClick}
                ref={refCallback}
                style={{
                    width: '34px',
                    height: '47px'
                }}>
                <img width={34} height={47} src={markerIcon} alt="Marker" />
            </AdvancedMarker>

            {isSelected && (
                <LocationInfoWindow
                    location={location}
                    onClose={handleClose}
                />
            )}
        </>
    );
};

export default LocationMarker;
