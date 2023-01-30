import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';

function MapMarker({position, clusterer, children}) {

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const onLoad = infoWindow => {}

    return (
        <Marker onClick={() => setIsInfoWindowOpen(!isInfoWindowOpen)} 
            position={position} 
            clusterer={clusterer}
            icon={{
                url: "images/map_marker.svg"
            }}>
            {isInfoWindowOpen && <InfoWindow onLoad={onLoad} position={position} onCloseClick={() => setIsInfoWindowOpen(false)}>
                {children}
            </InfoWindow>}
        </Marker>
    )
}

export default MapMarker
