import { useState, useEffect } from 'react';
import { regionService } from '@/shared/services/regionService';

/**
 * Loads the region list once.
 *
 * Regions arrive one at a time on the entities that reference them — a
 * location carries its own region and a `parentRegionId`, never its
 * ancestors — so any screen that wants the hierarchy needs the whole list.
 * It is small and changes rarely, which is what makes fetching all of it
 * reasonable.
 * @returns {{regions: Array<Object>, isLoading: boolean}} The regions and load state.
 */
function useRegions() {
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        (async () => {
            const result = await regionService.getRegions();
            if (isActive) {
                setRegions(result);
                setIsLoading(false);
            }
        })();

        return () => { isActive = false; };
    }, []);

    return { regions, isLoading };
}

export default useRegions;
