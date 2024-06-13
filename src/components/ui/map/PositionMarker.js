import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import marker from '../../../assets/images/position_marker.svg';

function PositionMarker({ position }) {
    return (
        position ? <AdvancedMarker
            key={position.lat + position.lng}
            position={{ lat: position.lat, lng: position.lng }}
            style={{
                width: '24px',
                height: '24px',
                transform: 'translate(0px, 12px)'
            }}>
            <img width={24} height={24} src={marker} alt="Current user location" />
        </AdvancedMarker> : <></>
    )
}

export default PositionMarker