import { useSearchParams } from 'react-router-dom';

/**
 * Applies a partial update to a set of URL search params, keeping URLs
 * clean: empty/null values (and empty arrays) delete their key, and array
 * values are written as repeated params. Pure — exported for testing.
 * @param {URLSearchParams} searchParams - The current params.
 * @param {Object} patch - Key/value pairs to set (or clear).
 * @returns {URLSearchParams} A new URLSearchParams with the patch applied.
 */
export const applyParamPatch = (searchParams, patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
        next.delete(key);
        if (Array.isArray(value)) {
            value.forEach(item => next.append(key, item));
        } else if (value !== '' && value != null) {
            next.set(key, value);
        }
    });

    return next;
};

/**
 * URL-driven filter and paging state shared by the list pages (locations,
 * species, permits). Updates replace the history entry so typing in a
 * filter doesn't pollute the Back button; filter changes should also clear
 * `page` (pass `page: ''` in the patch) so results restart at page 1.
 * @returns {{
 *   searchParams: URLSearchParams,
 *   patchParams: (patch: Object) => void,
 *   currentPage: number,
 *   goToPage: (page: number) => void
 * }}
 */
function useUrlFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get('page')) || 1;

    /**
     * Updates the URL search params, deleting keys whose value is
     * empty/null (or an empty array) so a clean URL stays clean.
     * @param {Object} patch - Key/value pairs to set (or clear) on the URL.
     */
    const patchParams = (patch) => {
        setSearchParams(applyParamPatch(searchParams, patch), { replace: true });
    };

    /**
     * Navigates to a results page, dropping the param for page 1 and
     * scrolling back to the top of the list.
     * @param {number} page - The 1-based page number.
     */
    const goToPage = (page) => {
        patchParams({ page: page > 1 ? page : '' });
        window.scrollTo(0, 0);
    };

    return { searchParams, patchParams, currentPage, goToPage };
}

export default useUrlFilters;
