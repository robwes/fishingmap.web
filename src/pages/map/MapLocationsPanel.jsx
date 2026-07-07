import React, { useEffect, useMemo, useRef } from 'react';
import LocationSpeciesItem from '../../components/ui/location/LocationSpeciesItem';
import geoUtils from '../../utils/geoUtils';
import { formatKm } from '../../utils/formatDistance';
import './MapLocationsPanel.scss';

// Species pills shown per row before collapsing into a "+N" note, so long
// species lists don't make rows tower over each other.
const MAX_SPECIES_CHIPS = 3;

/**
 * Desktop-only sidebar beside the map listing the locations that match the
 * current filters. Rows are sorted nearest-first when the user's position is
 * known (falling back to name order, mirroring the Locations list page).
 * Selecting a row focuses the map on that spot; the row of the marker
 * selected on the map is highlighted and scrolled into view. Hidden below
 * 1100px via CSS — on narrow screens the map stays full-width.
 * @param {Object} props
 * @param {Array} props.locations - Marker-shaped locations ({id, name, position, species}).
 * @param {boolean} props.show - Whether results have resolved at least once.
 * @param {?number} props.selectedId - Id of the location selected on the map, if any.
 * @param {(location: Object) => void} props.onSelect - Called with the clicked location.
 * @param {?{latitude: number, longitude: number}} props.currentLocation - The user's position.
 * @param {boolean} props.hasActiveFilters - Whether any filter is applied.
 * @param {() => void} props.onReset - Clears all active filters.
 */
function MapLocationsPanel({ locations, show, selectedId, onSelect, currentLocation, hasActiveFilters, onReset }) {
    const listRef = useRef(null);

    // Annotate each location with its distance from the user (when known),
    // then sort nearest-first or alphabetically.
    const rows = useMemo(() => {
        const annotated = locations.map(location => ({
            location,
            distance: currentLocation
                ? geoUtils.distanceKm(currentLocation, location.position)
                : null
        }));

        annotated.sort((a, b) => {
            if (currentLocation) {
                return a.distance - b.distance;
            }
            return a.location.name.localeCompare(b.location.name);
        });

        return annotated;
    }, [locations, currentLocation]);

    // Keep the highlighted row visible when a marker is selected on the map.
    useEffect(() => {
        if (selectedId == null || !listRef.current) {
            return;
        }
        const row = listRef.current.querySelector(`[data-location-id="${selectedId}"]`);
        if (row) {
            row.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedId]);

    const count = locations.length;

    return (
        <aside className="map-locations-panel" aria-label="Locations on the map">
            <header className="map-locations-panel-head">
                {show && count > 0 && (
                    <span><b>{count}</b> {count === 1 ? 'spot' : 'spots'}</span>
                )}
            </header>

            <div className="map-locations-panel-body">
                {show && count === 0 ? (
                    <div className="map-locations-panel-empty">
                        <i className="fas fa-water" aria-hidden="true" />
                        {hasActiveFilters ? (
                            <>
                                <p>No locations match your filters.</p>
                                <button type="button" onClick={onReset}>Reset filters</button>
                            </>
                        ) : (
                            <p>No locations to show.</p>
                        )}
                    </div>
                ) : (
                    <ul className="map-locations-panel-list" ref={listRef}>
                        {rows.map(({ location, distance }) => {
                            const species = location.species ?? [];
                            const shownSpecies = species.slice(0, MAX_SPECIES_CHIPS);
                            const extraSpecies = species.length - shownSpecies.length;
                            const isSelected = location.id === selectedId;

                            return (
                                <li key={location.id}>
                                    <button
                                        type="button"
                                        data-location-id={location.id}
                                        className={`map-locations-panel-item${isSelected ? ' is-selected' : ''}`}
                                        onClick={() => onSelect(location)}>
                                        <span className="map-locations-panel-item-top">
                                            <span className="map-locations-panel-item-name">{location.name}</span>
                                            {distance != null && (
                                                <span className="map-locations-panel-item-distance">
                                                    <i className="fas fa-location-arrow" aria-hidden="true" /> {formatKm(distance)}
                                                </span>
                                            )}
                                        </span>
                                        {shownSpecies.length > 0 && (
                                            <span className="map-locations-panel-item-species">
                                                {shownSpecies.map(s => (
                                                    <LocationSpeciesItem key={s.id} species={s} />
                                                ))}
                                                {extraSpecies > 0 && (
                                                    <span className="map-locations-panel-item-more">+{extraSpecies} more</span>
                                                )}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default MapLocationsPanel;
