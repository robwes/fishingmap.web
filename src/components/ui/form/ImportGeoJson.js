import React, { useRef } from 'react';
import Button from '../buttons/Button';
import geoUtils from '../../../utils/geoUtils';
import './ImportGeoJson.scss';

function ImportGeoJson({onImport, onError}) {
    const fileInputRef = useRef(null);

    const handleImportClick = (event) => {
        event.preventDefault();
        fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = () => {
            parseFileContent(reader.result);
        };

        reader.readAsText(file);
    };

    const parseFileContent = (result) => {
        try {
            const geoJson = JSON.parse(result);

            if (!geoUtils.isFeatureCollectionOfPolygons(geoJson)) {
                onError("Input must be a FeatureCollection of polygons");
                return;
            }

            const polygons = filterPolygons(geoJson);
            onImport(polygons);
        } 
        catch (e) {
            onError("Failed to read file content");
        }
    }

    const filterPolygons = geoJson => {
        geoJson.features = geoJson.features.filter(f => {
            const geoType = f.geometry.type;
            return (geoType === "Polygon" || geoType === "MultiPolygon");
        });

        return geoJson;
    }

    return (
        <div className='import-geojson'>
            <Button
                onClick={handleImportClick}>
                Import
            </Button>
            <input
                className='import-geojson-file'
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload} />
        </div>
    )
}

export default ImportGeoJson