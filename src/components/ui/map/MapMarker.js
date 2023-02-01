import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import marker from '../../../assets/images/map_marker.svg';

function MapMarker({position, clusterer, children}) {

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const onLoad = infoWindow => {}

    return (
        <Marker onClick={() => setIsInfoWindowOpen(!isInfoWindowOpen)} 
            position={position} 
            clusterer={clusterer}
            icon={{
                url: marker
            }}>
            {isInfoWindowOpen && <InfoWindow onLoad={onLoad} position={position} onCloseClick={() => setIsInfoWindowOpen(false)}>
                {children}
            </InfoWindow>}
        </Marker>
    )
}

export default MapMarker
