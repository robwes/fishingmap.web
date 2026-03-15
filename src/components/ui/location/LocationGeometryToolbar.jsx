import React from 'react';
import Button from '../buttons/Button';
import './LocationGeometryToolbar.scss';

const LocationGeometryToolbar = ({ onDrawingModeChanged, onRemoveFeature, drawingMode }) => {

    const drawPolygonClick = (event) => {
        event.preventDefault();
        onDrawingModeChanged('Polygon');
    }

    const placeMarkerClick = (event) => {
        event.preventDefault();
        onDrawingModeChanged('Point');
    }

    const removeFeatureClick = (event) => {
        event.preventDefault();
        onRemoveFeature();
    }

    return (
        <div className='location-geometry-toolbar'>
            <Button
                className={'toolbar-button' + (drawingMode === 'Polygon' ? ' active' : '')} 
                onClick={drawPolygonClick}>
                <i className="fas fa-draw-polygon"></i>
            </Button>
            <Button
                className={'toolbar-button' + (drawingMode === 'Point' ? ' active' : '')}
                onClick={placeMarkerClick}>
                <i className="fas fa-directions"></i>
            </Button>
            <Button
                className='toolbar-button'
                onClick={removeFeatureClick}>
                <i className="fas fa-trash"></i>
            </Button>
        </div>
    );
};

export default LocationGeometryToolbar;
