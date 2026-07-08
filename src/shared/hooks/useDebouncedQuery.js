import { useEffect, useRef, useState } from 'react';

/**
 * Debounced data fetching for auto-applying filter pages. Re-runs `queryFn`
 * `delay` ms after the last change to `deps`, so typing doesn't fire a
 * request per keystroke, and ignores results from runs that have been
 * superseded. Keeps the previous data while loading; a falsy result leaves
 * the data untouched (services return sentinels on failure).
 * @param {Function} queryFn - Async function returning the data. Read fresh
 *   on every run, so it may close over changing values — `deps` decides
 *   when a refetch happens.
 * @param {Array} deps - Dependency list that triggers a refetch. Stringify
 *   array values (e.g. `JSON.stringify(ids)`) so a new-but-equal array
 *   doesn't refetch.
 * @param {{ initial?: any, delay?: number }} [options]
 * @returns {{ data: any, isLoading: boolean }}
 */
function useDebouncedQuery(queryFn, deps, { initial = null, delay = 250 } = {}) {
    const [data, setData] = useState(initial);
    const [isLoading, setIsLoading] = useState(true);

    // Keep the latest queryFn without making it a dependency.
    const queryRef = useRef(queryFn);
    useEffect(() => {
        queryRef.current = queryFn;
    });

    useEffect(() => {
        let active = true;
        setIsLoading(true);

        const timer = setTimeout(async () => {
            const result = await queryRef.current();
            if (!active) {
                return;
            }
            if (result) {
                setData(result);
            }
            setIsLoading(false);
        }, delay);

        return () => {
            active = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, isLoading };
}

export default useDebouncedQuery;
