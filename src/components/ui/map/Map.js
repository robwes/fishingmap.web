import React from 'react';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';

const defaultMapStyle = {
    width: '100%',
    height: 'calc(100vh - (var(--header-height) + var(--footer-height)))',
    minHeight: '550px'
};

const Map = ({
    children,
    center,
    zoom,
    mapStyle
}) => {

    const getMapStyle = () => {
        if (mapStyle) {
            return mapStyle;
        }

        return defaultMapStyle;
    }

    return (
        <GoogleMap
            mapId={process.env.REACT_APP_MAP_ID}
            style={getMapStyle()}
            defaultCenter={center}
            defaultZoom={zoom}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControlOptions={{ position: 3 }}
            zoomControlOptions={{ position: 9 }}
            gestureHandling={'greedy'}
        >
            {children}
        </GoogleMap>
    );
};

export default Map;