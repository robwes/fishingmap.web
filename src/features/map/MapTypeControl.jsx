import React, { useState, useEffect } from 'react';
import { MapControl, ControlPosition, useMap } from '@vis.gl/react-google-maps';
import './MapTypeControl.scss';

const MAP_TYPE_STORAGE_KEY = 'mapTypeId';
const validMapTypes = ['roadmap', 'hybrid', 'terrain'];

/**
 * Reads the map type chosen earlier in this session, falling back to the
 * roadmap default when nothing valid is stored.
 * @returns {string} A Google Maps map type id.
 */
const readStoredMapType = () => {
    const stored = sessionStorage.getItem(MAP_TYPE_STORAGE_KEY);
    return validMapTypes.includes(stored) ? stored : 'roadmap';
};

/**
 * Map-type switcher (Map / Satellite / Terrain) rendered as a Google Maps
 * custom control. Its position on the map is configurable so each page can
 * place it wherever it fits that page's overlay layout.
 * @param {Object} props
 * @param {number} [props.position] - A google.maps ControlPosition value
 * (from the library's ControlPosition enum); defaults to TOP_RIGHT.
 */
const MapTypeControl = ({ position = ControlPosition.TOP_RIGHT }) => {
    const map = useMap();
    const [mapTypeId, setMapTypeId] = useState(readStoredMapType);

    // Apply the selection to the map and remember it for the rest of the
    // session, so returning to the map keeps the chosen map type.
    useEffect(() => {
        if (map) {
            map.setMapTypeId(mapTypeId);
        }
        sessionStorage.setItem(MAP_TYPE_STORAGE_KEY, mapTypeId);
    }, [map, mapTypeId]);

    return (
        <MapControl position={position}>
            <div className="map-type-control">
                <button
                    type="button"
                    className={mapTypeId === 'roadmap' ? 'active' : ''}
                    onClick={() => setMapTypeId('roadmap')}>
                    Map
                </button>
                <button
                    type="button"
                    className={mapTypeId === 'hybrid' ? 'active' : ''}
                    onClick={() => setMapTypeId('hybrid')}>
                    Satellite
                </button>
                <button
                    type="button"
                    className={mapTypeId === 'terrain' ? 'active' : ''}
                    onClick={() => setMapTypeId('terrain')}>
                    Terrain
                </button>
            </div>
        </MapControl>
    );
};

export default MapTypeControl;
