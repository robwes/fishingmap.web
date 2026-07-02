import { describe, it, expect } from 'vitest';
import { applyParamPatch } from './useUrlFilters';

describe('applyParamPatch', () => {
    it('sets new keys and keeps existing ones', () => {
        const result = applyParamPatch(new URLSearchParams('q=pike'), { sort: 'name' });

        expect(result.get('q')).toBe('pike');
        expect(result.get('sort')).toBe('name');
    });

    it('deletes keys patched with empty or null values', () => {
        const result = applyParamPatch(new URLSearchParams('q=pike&page=3'), { q: '', page: null });

        expect(result.toString()).toBe('');
    });

    it('writes arrays as repeated params and replaces previous values', () => {
        const result = applyParamPatch(new URLSearchParams('sIds=1'), { sIds: [2, 3] });

        expect(result.getAll('sIds')).toEqual(['2', '3']);
    });

    it('deletes a key patched with an empty array', () => {
        const result = applyParamPatch(new URLSearchParams('sIds=1&sIds=2'), { sIds: [] });

        expect(result.has('sIds')).toBe(false);
    });

    it('keeps zero as a value (only empty string and null/undefined clear)', () => {
        const result = applyParamPatch(new URLSearchParams(), { distance: 0 });

        expect(result.get('distance')).toBe('0');
    });

    it('does not mutate the input params', () => {
        const input = new URLSearchParams('q=pike');
        applyParamPatch(input, { q: '' });

        expect(input.get('q')).toBe('pike');
    });
});
