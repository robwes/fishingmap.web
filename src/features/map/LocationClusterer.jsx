/*global google*/
import React, { useRef, useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer as GoogleMapsMarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import LocationMarker from './LocationMarker';
import './LocationClusterer.scss';

/**
 * Renders a cluster as a brand-colored count badge matching the fish pins,
 * replacing the clusterer's default blue bubbles.
 */
const clusterRenderer = {
    render: ({ count, position }) => {
        const badge = document.createElement('div');
        badge.className = 'cluster-badge';
        badge.textContent = String(count);

        return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: badge,
            // Same convention as the default renderer: keep clusters above
            // single markers, and bigger clusters above smaller ones.
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
        });
    }
};

const LocationClusterer = ({ locations, selectedLocationId, onSelect }) => {
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
                renderer: clusterRenderer,
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
                    isSelected={location.id === selectedLocationId}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
};

export default LocationClusterer;
