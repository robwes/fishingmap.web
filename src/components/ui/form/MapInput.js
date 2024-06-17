import React, { useState, useEffect, useCallback } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useField } from 'formik';
import Map from '../map/Map';
import Label from './Label';
import Error from './Error';
import ImportGeoJson from './ImportGeoJson';
import geoUtils from '../../../utils/geoUtils';
import './MapInput.scss';

const mapStyle = {
    width: '100%',
    height: '650px'
};

function MapInput({ label, options, className, ...props }) {

    const map = useMap();

    // eslint-disable-next-line
    const [field, meta, helpers] = useField(props);

    const { value } = meta;
    const { setValue, setError } = helpers;

    const [dataLayer, setDataLayer] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!dataLayer) {
            return;
        }
        if (value) {
            dataLayer.addGeoJson(value);

            const boundingBox = geoUtils.getBoundingBox(value);
            if (boundingBox) {
                dataLayer.getMap().fitBounds(boundingBox);
            }
        }

        dataLayer.addListener("mousedown", handleMouseDown);
        dataLayer.addListener("mouseup", handleMouseUp);
        dataLayer.addListener("addfeature", handleAddFeature);
        dataLayer.addListener("dblclick", handleRemoveFeature);
        dataLayer.addListener("setgeometry", handleSetGeometry);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataLayer])

    useEffect(() => {
        if (!map) {
            return;
        }

        const data = map.data;
        data.setStyle({
            fillColor: "#4285f4",
            strokeColor: "#4285f4",
            strokeWeight: 5,
            draggable: false,
            editable: true
        });

        const topLeftPos = window.google ? window.google.maps.ControlPosition.TOP_LEFT : 1;
        data.setControlPosition(topLeftPos);
        data.setControls(["Polygon"]);
        data.setDrawingMode("Polygon");

        setDataLayer(data);
    }, [map]);

    const handleAddFeature = event => {
        dataLayer.setDrawingMode(null);

        dataLayer.toGeoJson(geoJson => {
            setValue(geoJson);
        });
    }

    const handleImport = geoJson => {
        dataLayer.forEach(feature => {
            dataLayer.remove(feature);
        });
        dataLayer.addGeoJson(geoJson);

        const boundingBox = geoUtils.getBoundingBox(geoJson);
        if (boundingBox) {
            dataLayer.getMap().fitBounds(boundingBox);
        }
    }

    const handleImportError = errorMessage => {
        setError(errorMessage);
    }

    const handleMouseDown = event => {
        setIsDragging(true);
    }

    const handleMouseUp = event => {
        setIsDragging(false);
    }

    const handleRemoveFeature = event => {
        dataLayer.remove(event.feature);

        dataLayer.toGeoJson(geoJson => {
            setValue(geoJson);
        });
    }

    const handleSetGeometry = useCallback((event) => {
        if (!isDragging) {
            dataLayer.toGeoJson(geoJson => {
                setValue(geoJson);
            });
        }
      }, [dataLayer, isDragging, setValue]);

    // const handleSetGeometry = event => {
    //     if (!isDragging) {
    //         dataLayer.toGeoJson(geoJson => {
    //             setValue(geoJson);
    //         });
    //     }
    // }

    return (
        <div className={className}>

            {label &&
                <Label htmlFor={props.id || props.name}>{label}</Label>
            }

            <div className="map-input">
                <ImportGeoJson
                    onImport={handleImport}
                    onError={handleImportError}
                />
                <Map
                    center={options.center}
                    zoom={options.zoom}
                    mapStyle={mapStyle}
                    fullscreenControl={false}
                    streetViewControl={false} />
            </div>
            {meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default MapInput
