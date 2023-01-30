import React from 'react';
import { Link } from 'react-router-dom';
import MapMarker from '../map-components/MapMarker';

function LocationMarker({ location, clusterer }) {
    const position = {
        lat: location.position.latitude,
        lng: location.position.longitude
    };
    return (
        <MapMarker position={position} clusterer={clusterer}>
            <div className="location-info-window">
                <h3><Link to={`/locations/${location.id}`}>{location.name}</Link></h3>
                <p>{location.description}</p>
            </div>
        </MapMarker>
    )
}

export default LocationMarker