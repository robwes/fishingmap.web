import { describe, it, expect } from 'vitest';
import { findMissingEnvVars } from './assertEnv';

describe('findMissingEnvVars', () => {
    it('returns an empty list when all values are present', () => {
        expect(findMissingEnvVars({ A: 'x', B: 'y' })).toEqual([]);
    });

    it('reports undefined and empty-string values as missing', () => {
        const result = findMissingEnvVars({
            VITE_BASE_URL: 'https://api.test',
            VITE_IMAGES_URL: '',
            VITE_MAPS_API_KEY: undefined,
            VITE_MAP_ID: 'abc',
        });

        expect(result).toEqual(['VITE_IMAGES_URL', 'VITE_MAPS_API_KEY']);
    });
});
