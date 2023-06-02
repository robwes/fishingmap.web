import React from 'react';
import MapMarker from '../../components/ui/map/MapMarker';
import LocationInfoWindow from './LocationInfoWindow';

function LocationMarker({ location, clusterer }) {
    const position = {
        lat: location.position.latitude,
        lng: location.position.longitude
    };

    return (
        <MapMarker position={position} clusterer={clusterer}>
            <LocationInfoWindow location={location} />
        </MapMarker>
    )
}

export default LocationMarker