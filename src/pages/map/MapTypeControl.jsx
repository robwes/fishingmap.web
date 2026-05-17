import React, { useState, useEffect } from 'react';
import { MapControl, ControlPosition, useMap } from '@vis.gl/react-google-maps';
import './MapTypeControl.scss';

const MapTypeControl = () => {
    const map = useMap();
    const [mapTypeId, setMapTypeId] = useState('roadmap');

    useEffect(() => {
        if (map) {
            map.setMapTypeId(mapTypeId);
        }
    }, [map, mapTypeId]);

    return (
        <MapControl position={ControlPosition.TOP_RIGHT}>
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
