// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import useUrlFilters, { applyParamPatch } from './useUrlFilters';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('applyParamPatch', () => {
    it('sets new keys and keeps existing ones', () => {
        const params = new URLSearchParams('q=pike');
        const next = applyParamPatch(params, { page: 2 });
        expect(next.get('q')).toBe('pike');
        expect(next.get('page')).toBe('2');
    });

    it('deletes keys patched with empty or null values', () => {
        const params = new URLSearchParams('q=pike&page=2');
        const next = applyParamPatch(params, { q: '', page: null });
        expect([...next.keys()]).toEqual([]);
    });

    it('writes arrays as repeated params and replaces previous values', () => {
        const params = new URLSearchParams('sIds=1');
        const next = applyParamPatch(params, { sIds: [2, 3] });
        expect(next.getAll('sIds')).toEqual(['2', '3']);
    });

    it('deletes a key patched with an empty array', () => {
        const params = new URLSearchParams('sIds=1&sIds=2');
        const next = applyParamPatch(params, { sIds: [] });
        expect(next.has('sIds')).toBe(false);
    });

    it('keeps zero as a value (only empty string and null/undefined clear)', () => {
        const params = new URLSearchParams();
        const next = applyParamPatch(params, { distance: 0 });
        expect(next.get('distance')).toBe('0');
    });

    it('does not mutate the input params', () => {
        const params = new URLSearchParams('q=pike');
        applyParamPatch(params, { q: '' });
        expect(params.get('q')).toBe('pike');
    });
});

/**
 * Renders useUrlFilters inside a MemoryRouter, also exposing the current
 * location and navigate so tests can observe the resulting URL and history.
 * @param {string[]} initialEntries - The router's history stack.
 * @param {number} [initialIndex] - The active entry (defaults to the last).
 */
const renderUrlFilters = (initialEntries, initialIndex) => renderHook(
    () => {
        const filters = useUrlFilters();
        return { ...filters, location: useLocation(), navigate: useNavigate() };
    },
    {
        wrapper: ({ children }) => (
            <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
                {children}
            </MemoryRouter>
        )
    }
);

describe('useUrlFilters', () => {
    it('reads the current page from the URL, defaulting to 1 on missing or garbage values', () => {
        expect(renderUrlFilters(['/locations?page=3']).result.current.currentPage).toBe(3);
        expect(renderUrlFilters(['/locations?page=abc']).result.current.currentPage).toBe(1);
        expect(renderUrlFilters(['/locations']).result.current.currentPage).toBe(1);
    });

    it('patches filters onto the URL while clearing the paging in the same update', () => {
        const { result } = renderUrlFilters(['/locations?page=3']);

        act(() => {
            result.current.patchParams({ q: 'pike', page: '' });
        });

        expect(result.current.location.search).toBe('?q=pike');
        expect(result.current.currentPage).toBe(1);
    });

    it('drops the page param entirely for page 1 so clean URLs stay clean', () => {
        window.scrollTo = vi.fn();
        const { result } = renderUrlFilters(['/locations']);

        act(() => {
            result.current.goToPage(2);
        });
        expect(result.current.location.search).toBe('?page=2');

        act(() => {
            result.current.goToPage(1);
        });
        expect(result.current.location.search).toBe('');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('replaces the history entry so filter changes do not stack Back-button entries', () => {
        const { result } = renderUrlFilters(['/home', '/locations'], 1);

        act(() => {
            result.current.patchParams({ q: 'pike' });
        });
        act(() => {
            result.current.navigate(-1);
        });

        // With push instead of replace, back would land on the pre-patch
        // /locations entry rather than leaving the page.
        expect(result.current.location.pathname).toBe('/home');
    });
});
