/*global google*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import Map from '../map/Map';
import LocationGeometryToolbar from './LocationGeometryToolbar';
import ImportGeoJson from '../form/ImportGeoJson';
import geoUtils from '../../../utils/geoUtils';
import NavigationPositionMarker from '../map/NavigationPositionMarker';
import useData from '../map/useData';
import './LocationGeometryEditor.scss';

const mapStyle = {
    width: '100%',
    height: '650px'
};

const polygonStyle = {
    fillOpacity: 0.0,
    strokeColor: "#3972ce",
    strokeWeight: 4,
    draggable: false,
    editable: false
};

const selectedPolygonStyle = {
    fillOpacity: 0.0,
    strokeColor: "#3972ce",
    strokeWeight: 4,
    draggable: false,
    editable: true
};

const LocationGeometryEditor = ({ 
    locationGeometry, 
    locationNavigationPosition,
    location,
    onGeometryChanged, 
    onNavigationPositionChanged, 
    onError }) => {
    const map = useMap();

    const [drawingMode, setDrawingMode] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [navigationPositionFeature, setNavigationPositionFeature] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Track the last GeoJSON we pushed to Formik so we can ignore it when it comes back as a prop
    const lastDispatchedGeometry = useRef(null);

    // Call only when map interactions genuinely mutate geometry
    const checkAndDispatchGeometry = useCallback((layer) => {
        if (!layer || !onGeometryChanged) return;
        layer.toGeoJson(geoJson => {
            const currentStr = JSON.stringify(geoJson);
            const dispatchedStr = JSON.stringify(lastDispatchedGeometry.current);
            if (currentStr !== dispatchedStr) {
                lastDispatchedGeometry.current = geoJson;
                onGeometryChanged(geoJson);
            }
        });
    }, [onGeometryChanged]);

    const handleSelectFeature = useCallback(event => {
        if (isDragging) return; // Prevent selection if dragging
        setSelectedFeature(event.feature);
    }, [isDragging]);
    
    // We will bind an inline function to pass dataLayer correctly below.

    const dataLayer = useData(
        (event) => {
            // handleAddFeature
            if (dataLayer) {
                checkAndDispatchGeometry(dataLayer);
            }
            setSelectedFeature(event.feature);
            setDrawingMode(null);
        },
        handleSelectFeature,
        () => {
            // handleSetGeometry, removefeature etc
            if (dataLayer) {
                checkAndDispatchGeometry(dataLayer);
            }
        }
    );

    const updateNavigationPosition = useCallback((latLng) => {
        const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
        const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
        
        const pointFeature = new google.maps.Data.Feature({
            geometry: new google.maps.Data.Point({ lat, lng })
        });

        setNavigationPositionFeature(pointFeature); // Store the point as a feature
        setSelectedFeature(pointFeature); // Store the point as a feature

        if (onNavigationPositionChanged) {
            onNavigationPositionChanged({ latitude: lat, longitude: lng });
        }
    }, [onNavigationPositionChanged]);

    const handleAddNavigationPosition = useCallback((mapsMouseEvent) => {
        if (drawingMode === "Point") {
            updateNavigationPosition(mapsMouseEvent.detail.latLng);
            setDrawingMode(null);
        }
    }, [drawingMode, updateNavigationPosition]);

    const handleRemoveSelectedFeature = useCallback(() => {
        if (selectedFeature) {
            if (selectedFeature.getGeometry().getType() === "Point") {
                setNavigationPositionFeature(null);
                if (onNavigationPositionChanged) {
                    onNavigationPositionChanged(null);
                }
            } else {
                dataLayer.remove(selectedFeature);
                checkAndDispatchGeometry(dataLayer);
            }
        }
        setSelectedFeature(null);
    }, [selectedFeature, dataLayer, checkAndDispatchGeometry, onNavigationPositionChanged]);

    const handleSelectNavigationPosition = useCallback(event => {
        setSelectedFeature(navigationPositionFeature);
    }, [navigationPositionFeature]);

    const handleDeselectAll = useCallback(() => {
        if (!isDragging) {
            setSelectedFeature(null);
        }
    }, [isDragging]);

    const handleMarkerDragStart = useCallback(() => {
        setIsDragging(true); // Set dragging state to true
    }, []);

    const handleMarkerDragEnd = useCallback((event) => {
        const latLng = event.latLng || (event.detail && event.detail.latLng) || (event.target && event.target.position);
        
        if (latLng) {
            updateNavigationPosition(latLng);
        }

        setTimeout(() => {
            setIsDragging(false); // Set dragging state to false
        }, 50);

    }, [updateNavigationPosition]);

    const handleDrawingModeChanged = useCallback((mode) => {
        if (mode === drawingMode) {
            setDrawingMode(null);
        } else {
            setDrawingMode(mode);
        }

        setSelectedFeature(null);
    }, [drawingMode]);

    const handleImport = useCallback(geoJson => {
        dataLayer.forEach(feature => {
            dataLayer.remove(feature);
        });
        dataLayer.addGeoJson(geoJson);

        const boundingBox = geoUtils.getBoundingBox(geoJson);
        if (boundingBox) {
            map.fitBounds(boundingBox);
        }
    }, [map, dataLayer]);

    const handleImportError = useCallback(errorMessage => {
        onError(errorMessage);
    }, [onError]);

    useEffect(() => {
        if (!dataLayer || !locationGeometry) return;

        const strFormik = JSON.stringify(locationGeometry);
        const strLastDispatched = JSON.stringify(lastDispatchedGeometry.current);

        // If the prop update is just Formik echoing our own last dispatch, do nothing!
        if (strFormik === strLastDispatched) {
            return;
        }

        // Clean out existing features to load the new ones from Formik
        dataLayer.forEach(feature => {
            dataLayer.remove(feature);
        });

        // Add features if present
        if (locationGeometry.features && locationGeometry.features.length > 0) {
            dataLayer.addGeoJson(locationGeometry);

            // Fit bounds to show the entire geometry
            if (map) {
                const boundingBox = geoUtils.getBoundingBox(locationGeometry);
                if (boundingBox) {
                    map.fitBounds(boundingBox);
                }
            }
        }

        // Update the dispatcher ref so we know we are in sync
        lastDispatchedGeometry.current = locationGeometry;
        
    }, [locationGeometry, dataLayer, map]);

    useEffect(() => {
        if (locationNavigationPosition) {
            const pointFeature = new google.maps.Data.Feature({
                geometry: new google.maps.Data.Point({
                    lat: locationNavigationPosition.latitude,
                    lng: locationNavigationPosition.longitude
                })
            });

            setNavigationPositionFeature(pointFeature);
        } else {
            setNavigationPositionFeature(null);
        }
    }, [locationNavigationPosition]);

    useEffect(() => {
        const mapClickHandler = map?.addListener('click', handleDeselectAll);

        return () => {
            mapClickHandler?.remove();
        }
    }, [map, handleDeselectAll]);

    useEffect(() => {
        if (!dataLayer) {
            return;
        }

        if (drawingMode === "Polygon") {
            dataLayer.setStyle(selectedPolygonStyle);
            dataLayer.setDrawingMode("Polygon");
        } else {
            dataLayer.setStyle(polygonStyle);
            dataLayer.setDrawingMode(null);
        }
    }, [drawingMode, dataLayer]);

    useEffect(() => {
        if (!dataLayer) {
            return;
        }

        dataLayer.forEach(feature => {
            if (feature.getGeometry().getType() === "Polygon") {
                dataLayer.overrideStyle(feature, polygonStyle);
            }
        });

        if (selectedFeature) {
            if (selectedFeature.getGeometry().getType() === "Polygon") {
                dataLayer.overrideStyle(selectedFeature, selectedPolygonStyle);
            }
        }

    }, [selectedFeature, dataLayer]);

    useEffect(() => {
        if (map) {
            if (drawingMode === "Point") {
                map.setOptions({ draggableCursor: 'crosshair' });
            } else {
                map.setOptions({ draggableCursor: null });
            }
        }
    }, [map, drawingMode]);

    const getCenter = () => {
        if (location && location.position) {
            return {
                lat: location.position.latitude,
                lng: location.position.longitude
            };
        }
        
        return { lat: 60.1695, lng: 24.9354 };
    }

    return (
        <div className='location-geometry-editor'>
            <LocationGeometryToolbar
                onDrawingModeChanged={handleDrawingModeChanged}
                onRemoveFeature={handleRemoveSelectedFeature}
                drawingMode={drawingMode}
            />
            <ImportGeoJson
                onImport={handleImport}
                onError={handleImportError}
            />
            <Map
                center={getCenter()}
                zoom={location && location.position ? 15 : 12}
                mapStyle={mapStyle}
                onClick={handleAddNavigationPosition}>
                {navigationPositionFeature && (
                    <NavigationPositionMarker
                        position={navigationPositionFeature.getGeometry().get()}
                        draggable={true}
                        onDragStart={handleMarkerDragStart}
                        onDragEnd={handleMarkerDragEnd}
                        onClick={handleSelectNavigationPosition}
                        isSelected={selectedFeature && selectedFeature.getGeometry().getType() === 'Point'}
                    />
                )}
            </Map>
        </div>
    );
};

export default LocationGeometryEditor;
