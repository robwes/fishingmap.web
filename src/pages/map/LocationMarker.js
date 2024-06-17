import React, { useState, useEffect, useCallback } from 'react';
import { AdvancedMarker, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import LocationInfoWindow from './LocationInfoWindow';
import markerIcon from '../../assets/images/map_marker.svg';

const LocationMarker = ({ location, clusterer }) => {
    const { latitude, longitude } = location.position;

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);
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

    // clicking the marker will toggle the infowindow
    const handleMarkerClick = useCallback(() =>
        setIsInfoWindowOpen(isShown => !isShown),
        []
    );

    // if the maps api closes the infowindow, we have to synchronize our state
    const handleClose = useCallback(() => setIsInfoWindowOpen(false), []);

    // Your LocationMarker component code here
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

            {isInfoWindowOpen && (
                <LocationInfoWindow
                    location={location}
                    onClose={handleClose}
                />
            )}
        </>
    );
};

export default LocationMarker;