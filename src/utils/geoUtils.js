import * as turf from '@turf/turf';

const geoUtils = {

    multiPolygonFeatureToPolygonFeatureCollection: (multiPolygonFeature) => {
        const featureCollection = { "type": "FeatureCollection", "features": [] };
        multiPolygonFeature.geometry.coordinates.forEach(p => {

            featureCollection.features.push({
                "type": "Feature",
                "geometry": { "type": "Polygon", "coordinates": p }
            });

        });

        return featureCollection;
    },

    polygonFeatureCollectionToMultiPolygonFeature: (featureCollection) => {

        // Extract the polygons from the FeatureCollection and combine them into a single MultiPolygon
        const polygons = featureCollection.features.map(feature => feature.geometry.coordinates);
        const multiPolygon = { type: "MultiPolygon", coordinates: polygons };

        // Create a new Feature using the MultiPolygon geometry
        const combinedFeature = { type: "Feature", properties: {}, geometry: multiPolygon };

        return combinedFeature;
    },

    getBoundingBox: (geoJson) => {
		const bbox = turf.bbox(geoJson);

		if (bbox) {
			return {
				north: bbox[3],
				south: bbox[1],
				east: bbox[2],
				west: bbox[0],
			  }
		}

        return null;
    },

    isFeatureCollectionOfPolygons: (geoJson) => {
        try {
            if (geoJson.type !== "FeatureCollection") {
                return false;
            }

            if (!Array.isArray(geoJson.features)) {
                return false;
            }

            const hasPolys = geoJson.features.some(feature => {
                const geomType = feature.geometry?.type;
                return geomType === 'Polygon' || geomType === 'MultiPolygon';
            });

            if (!hasPolys) {
                return false;
            }

            return true;

        } catch(e) {
            console.error(e);
        }

        return false;
    }

}

export default geoUtils;