import React from 'react';
import MarkerWithInfoWindow from './MarkerWithInfoWindow';
import marker from '../../../assets/images/navigation_position.svg';
import markerSelected from '../../../assets/images/navigation_position_selected.svg';
import './NavigationPositionMarker.scss';

function NavigationPositionMarker({ position, draggable, onClick, onDragStart, onDragEnd, isSelected }) {
    return (
        <MarkerWithInfoWindow
            position={position}
            draggable={draggable}
            onClick={onClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            icon={isSelected ? markerSelected : marker}
            iconAlt="Navigation position"
            isInfoWindowOpen={true}
            infoWindowMaxWidth={400}>

            <div className='navigation-info-window'>
                <h3 className='navigation-info-window-title'>Navigation Position (Optional)</h3>
                <p className='navigation-info-window-text'>
                    This position will be used as the destination when navigating to this location.<br /><br />
                    If no navigation position is set then the center of the location will be used instead.
                </p>
            </div>
            
        </MarkerWithInfoWindow>
    )
}

export default NavigationPositionMarker
