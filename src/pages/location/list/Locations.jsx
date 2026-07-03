import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationListItem from './LocationListItem';
import Pagination from '../../../components/ui/pagination/Pagination';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import SearchInput from '../../../components/ui/form/SearchInput';
import MultiSelectInput from '../../../components/ui/form/MultiSelectInput';
import RangeInput from '../../../components/ui/form/RangeInput';
import SortControl from './SortControl';
import ResetButton from '../../../components/ui/buttons/ResetButton';
import ButtonSuccess from '../../../components/ui/buttons/ButtonSuccess';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import { locationService } from '../../../services/locationService';
import { speciesService } from '../../../services/speciesService';
import { useCurrentUser } from '../../../context/CurrentUserContext';
import useUrlFilters from '../../../hooks/useUrlFilters';
import useDebouncedQuery from '../../../hooks/useDebouncedQuery';
import './Locations.scss';

const PAGE_LIMIT = 10;
const PAGE_NEIGHBOURS = 1;

function Locations() {
    const navigate = useNavigate();
    const [currentUser, , currentLocation] = useCurrentUser();
    const { searchParams, patchParams, currentPage, goToPage } = useUrlFilters();

    const [speciesOptions, setSpeciesOptions] = useState([]);

    const search = searchParams.get('q') ?? '';
    const speciesIds = searchParams.getAll('sIds').map(Number);
    const distance = parseInt(searchParams.get('distance')) || 0;
    const sortParam = searchParams.get('sort');

    // The distance filter is meaningless without an origin (and its slider is
    // hidden then), so ignore any lingering `distance` param when we have no
    // location — it must not reach the backend or count as an active filter.
    const effectiveDistance = currentLocation ? distance : 0;

    // Species options for the filter dropdowns.
    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s) {
                setSpeciesOptions(
                    s.map(sp => ({ label: sp.name, value: sp.id }))
                        .sort((a, b) => a.label.localeCompare(b.label))
                );
            }
        })();
    }, []);

    // currentLocation is passed unconditionally so the backend can
    // annotate/sort by distance even with no distance limit set.
    const { data: locations, isLoading } = useDebouncedQuery(
        () => locationService.getLocationsSummary(search, speciesIds, effectiveDistance, currentLocation),
        [search, JSON.stringify(speciesIds), effectiveDistance, currentLocation],
        { initial: [] }
    );

    const effectiveSort = sortParam || (currentLocation ? 'nearest' : 'name');

    const sortedLocations = [...locations].sort((a, b) => {
        if (effectiveSort === 'nearest') {
            return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        }
        return a.name.localeCompare(b.name);
    });

    const pagedLocations = sortedLocations.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT);

    // Hide the count until the first fetch resolves so the page doesn't flash
    // "0 spots" on entry. Re-queries keep the previous data, so the count stays
    // visible while filtering.
    const showCount = !isLoading || sortedLocations.length > 0;

    const onSearch = (value) => patchParams({ q: value, page: '' });
    const onSpeciesChange = (ids) => patchParams({ sIds: ids, page: '' });
    const onDistanceCommit = (value) => patchParams({ distance: value || '', page: '' });
    const onSortChange = (value) => patchParams({ sort: value });
    const onReset = () => patchParams({ q: '', sIds: [], distance: '', page: '' });

    const hasActiveFilters = !!search || speciesIds.length > 0 || effectiveDistance > 0;

    // The distance filter needs an origin: without geolocation the backend
    // ignores the radius, so the slider is only rendered once we have the
    // user's location (see the `currentLocation &&` guards below).
    const distanceFilterProps = {
        value: distance,
        onCommit: onDistanceCommit,
        min: 0,
        max: 100,
        unit: 'km',
    };

    return (
        <div className="locations page">
            {isLoading && <FloatingSpinner />}

            <SlideInPanel>
                <SearchInput
                    value={search}
                    onChange={onSearch}
                    placeholder="Search locations…"
                    ariaLabel="Search locations"
                />
                <MultiSelectInput
                    label="Species"
                    options={speciesOptions}
                    value={speciesIds}
                    onChange={onSpeciesChange}
                    placeholder="Any species…"
                />
                {currentLocation && <RangeInput label="Distance (km)" {...distanceFilterProps} />}
                {hasActiveFilters && <ResetButton onClick={onReset} />}
            </SlideInPanel>

            <div className="container">
                {currentUser && (
                    <div className="locations-head">
                        <ButtonSuccess onClick={() => navigate('/locations/add')}>
                            <i className="fas fa-plus" /> Add location
                        </ButtonSuccess>
                    </div>
                )}

                <div className="locations-toolbar">
                    <SearchInput
                        value={search}
                        onChange={onSearch}
                        placeholder="Search locations…"
                        ariaLabel="Search locations"
                    />
                    <MultiSelectInput
                        options={speciesOptions}
                        value={speciesIds}
                        onChange={onSpeciesChange}
                        placeholder="Species…"
                    />
                    {currentLocation && <RangeInput label="Distance" {...distanceFilterProps} />}
                    {hasActiveFilters && <ResetButton onClick={onReset} />}
                </div>

                <div className="loc-count-row">
                    <span className="loc-count-text">
                        {showCount && (
                            <><b>{sortedLocations.length}</b> {sortedLocations.length === 1 ? 'spot' : 'spots'}</>
                        )}
                    </span>
                    {currentLocation && (
                        <SortControl
                            value={effectiveSort}
                            onChange={onSortChange}
                            options={[
                                { value: 'nearest', label: 'Nearest' },
                                { value: 'name', label: 'Name (A–Z)' },
                            ]}
                        />
                    )}
                </div>

                {sortedLocations.length === 0 && !isLoading ? (
                    <div className="locations-empty">
                        <i className="fas fa-water" />
                        No locations match your filters.
                    </div>
                ) : (
                    <div className="item-list">
                        {pagedLocations.map(l => (
                            <LocationListItem key={l.id} location={l} />
                        ))}
                    </div>
                )}
            </div>

            <Pagination
                totalRecords={sortedLocations.length}
                pageLimit={PAGE_LIMIT}
                pageNeighbours={PAGE_NEIGHBOURS}
                currentPage={currentPage}
                onPageChanged={goToPage}
            />
        </div>
    );
}

export default Locations;
