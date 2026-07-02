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

    /**
     * Reads the chosen file and hands its content to the parser. Guards
     * against a cancelled/cleared file dialog (no file selected) and resets
     * the input value so choosing the same file again re-triggers onChange.
     * @param {React.ChangeEvent<HTMLInputElement>} event
     */
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            parseFileContent(reader.result);
        };

        reader.readAsText(file);
        event.target.value = '';
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
        catch {
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
                <i className="fas fa-file-import" /> Import
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
