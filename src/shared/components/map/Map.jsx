import React from 'react';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';

const defaultMapStyle = {
    position: 'absolute',
    inset: 0
};

const zoomControlOptions = { position: 9 };

const Map = ({
    children,
    center,
    zoom,
    mapStyle,
    onClick,
    ...props
}) => {

    const getMapStyle = () => {
        if (mapStyle) {
            return mapStyle;
        }

        return defaultMapStyle;
    }

    return (
        <GoogleMap
            mapId={import.meta.env.VITE_MAP_ID}
            style={getMapStyle()}
            defaultCenter={center}
            defaultZoom={zoom}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
            cameraControl={false}
            zoomControlOptions={zoomControlOptions}
            gestureHandling={'greedy'}
            onClick={onClick}
            {...props}
        >
            {children}
        </GoogleMap>
    );
};

export default Map;
