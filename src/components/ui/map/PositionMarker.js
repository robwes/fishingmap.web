import React from 'react';
import { Marker } from '@react-google-maps/api';
import marker from '../../../assets/images/position_marker.svg';

function PositionMarker({ position }) {
    return (
        position ? <Marker position={position} icon={marker} /> : <></>
    )
}

export default PositionMarker