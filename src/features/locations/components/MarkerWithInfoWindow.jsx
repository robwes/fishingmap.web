import React, { useState, useCallback } from 'react';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';

function MarkerWithInfoWindow({
    children,
    position,
    draggable,
    onClick,
    onDragStart,
    onDragEnd,
    icon,
    iconAlt,
    isInfoWindowOpen = false,
    infoWindowMaxWidth}) {

    const [isOpen, setIsOpen] = useState(isInfoWindowOpen);
    const [markerRef, marker] = useAdvancedMarkerRef();

    const handleMarkerClick = useCallback((event) => {
        setIsOpen(!isOpen);

        if (onClick) {
            onClick(event);
        }

    }, [isOpen, onClick]);

    return (
        <AdvancedMarker
            ref={markerRef}
            key={position.lat + position.lng}
            position={position}
            onDragStart={onDragStart}
            draggable={draggable}
            onDragEnd={onDragEnd}
            onClick={handleMarkerClick}>
            {isOpen && (<InfoWindow
                anchor={marker}
                maxWidth={infoWindowMaxWidth}
                onCloseClick={() => setIsOpen(false)}>
                {children}
            </InfoWindow>)}
            {icon && <img src={icon} alt={iconAlt} />}
        </AdvancedMarker>
    )
}

export default MarkerWithInfoWindow
