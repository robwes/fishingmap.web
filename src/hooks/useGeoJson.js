function useGeoJson() {

    function multiPolygonFeatureToPolygonFeatureCollection(multiPolygonFeature) {
        const featureCollection = { "type": "FeatureCollection", "features": [] };
        multiPolygonFeature.geometry.coordinates.forEach(p => {

            featureCollection.features.push({
                "type": "Feature",
                "geometry": { "type": "Polygon", "coordinates": p }
            });

        });

        return featureCollection;
    }

    function polygonFeatureCollectionToMultiPolygonFeature(polygonFeatureCollection) {
        const feature = {
            "type": "Feature",
            "geometry": { "type": "MultiPolygon", "coordinates": [] }
        }

        polygonFeatureCollection.features.forEach(f => {
            feature.geometry.coordinates.push(f.geometry.coordinates);
        });

        return feature;
    }

    return { multiPolygonFeatureToPolygonFeatureCollection, polygonFeatureCollectionToMultiPolygonFeature };
}

export default useGeoJson;