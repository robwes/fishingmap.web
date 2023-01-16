import React, { useCallback } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'

const defaultMapStyle = {
    width: '100%',
    height: 'calc(100vh - (var(--header-height) + var(--footer-height)))',
    minHeight: '550px'
};

const libraries = ["drawing"];

function Map({children, center, zoom, mapStyle, ...props}) {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
        libraries: libraries
    });

    const onLoad = useCallback((map) => {
        map.panTo(center);
    }, [center]);

    const onUnmount = useCallback((map) => {

    }, []);

    const getMapStyle = () => {
        if (mapStyle) {
            return mapStyle;
        }

        return defaultMapStyle;
    }

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={getMapStyle()}
            onLoad={onLoad}
            onUnmount={onUnmount}
            center={center}
            zoom={zoom}
            options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControlOptions: {
                    position: 3 // google.maps.ControlPosition.TOP_RIGHT
                }
            }}
            {...props}
        >
            {children}
        </GoogleMap>
    ) : <></>
}

export default Map
