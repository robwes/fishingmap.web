import { describe, it, expect } from 'vitest';
import geoUtils from './geoUtils';

const squareCoords = [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]];
const triangleCoords = [[[2, 2], [2, 3], [3, 2], [2, 2]]];

const polygonFeatureCollection = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: squareCoords } },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: triangleCoords } }
    ]
};

describe('polygonFeatureCollectionToMultiPolygonFeature', () => {
    it('combines the polygons into a single MultiPolygon feature', () => {
        const result = geoUtils.polygonFeatureCollectionToMultiPolygonFeature(polygonFeatureCollection);

        expect(result.type).toBe('Feature');
        expect(result.geometry.type).toBe('MultiPolygon');
        expect(result.geometry.coordinates).toEqual([squareCoords, triangleCoords]);
    });
});

describe('multiPolygonFeatureToPolygonFeatureCollection', () => {
    it('splits a MultiPolygon feature back into a FeatureCollection of polygons', () => {
        const multiPolygonFeature = geoUtils.polygonFeatureCollectionToMultiPolygonFeature(polygonFeatureCollection);

        const result = geoUtils.multiPolygonFeatureToPolygonFeatureCollection(multiPolygonFeature);

        expect(result.type).toBe('FeatureCollection');
        expect(result.features).toHaveLength(2);
        expect(result.features[0].geometry).toEqual({ type: 'Polygon', coordinates: squareCoords });
        expect(result.features[1].geometry).toEqual({ type: 'Polygon', coordinates: triangleCoords });
    });
});

describe('getBoundingBox', () => {
    it('returns the bounds of all features', () => {
        const result = geoUtils.getBoundingBox(polygonFeatureCollection);

        expect(result).toEqual({ west: 0, south: 0, east: 3, north: 3 });
    });
});

describe('isFeatureCollectionOfPolygons', () => {
    it('accepts a FeatureCollection containing polygons', () => {
        expect(geoUtils.isFeatureCollectionOfPolygons(polygonFeatureCollection)).toBe(true);
    });

    it('rejects a FeatureCollection without polygon features', () => {
        const pointsOnly = {
            type: 'FeatureCollection',
            features: [
                { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }
            ]
        };

        expect(geoUtils.isFeatureCollectionOfPolygons(pointsOnly)).toBe(false);
    });

    it('rejects objects that are not FeatureCollections', () => {
        expect(geoUtils.isFeatureCollectionOfPolygons({ type: 'Feature' })).toBe(false);
        expect(geoUtils.isFeatureCollectionOfPolygons({ type: 'FeatureCollection', features: null })).toBe(false);
    });
});
