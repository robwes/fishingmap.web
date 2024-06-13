import React, { useRef, useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer as GoogleMapsMarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import LocationMarker from './LocationMarker';

const LocationClusterer = ({ locations, clustererOptions }) => {
    const map = useMap();
    const clusterer = useRef(null);

    // Initialize MarkerClusterer
    useEffect(() => {
        if (!map) {
            return;
        }
        if (!clusterer.current) {
            clusterer.current = new GoogleMapsMarkerClusterer({ 
                map,
                algorithm: new SuperClusterAlgorithm({minPoints: 4}),
            });
        }
    }, [map]);

    return (
        <>
            {locations && locations.map(location => (
                <LocationMarker 
                    location={location} 
                    key={location.id}
                    clusterer={clusterer.current}
                />
            ))}
        </>
    );
};

export default LocationClusterer;