/*global google*/
import React, { useState, useEffect, useRef } from 'react';
import { useMap, ControlPosition } from '@vis.gl/react-google-maps';
import { locationService } from '@/shared/services/locationService';
import { speciesService } from '@/shared/services/speciesService';
import Map from '@/shared/components/map/Map';
import LocationClusterer from './LocationClusterer';
import MapTypeControl from './MapTypeControl';
import Circle from '../../components/ui/map/Circle';
import PositionMarker from '@/shared/components/map/PositionMarker';
import LocateButton from './LocateButton';
import MapResultStatus from './MapResultStatus';
import MapLocationsPanel from './MapLocationsPanel';
import SlideInPanel from '@/shared/components/slideInPanel/SlideInPanel';
import SearchInput from '@/shared/components/form/SearchInput';
import MultiSelectInput from '@/shared/components/form/MultiSelectInput';
import RangeInput from '@/shared/components/form/RangeInput';
import ResetButton from '@/shared/components/buttons/ResetButton';
import ViewToggle from '@/shared/components/viewToggle/ViewToggle';
import FloatingSpinner from '@/shared/components/spinner/FloatingSpinner';
import { useCurrentUser } from '@/shared/context/CurrentUserContext';
import useUrlFilters from '@/shared/hooks/useUrlFilters';
import useDebouncedQuery from '@/shared/hooks/useDebouncedQuery';
import './FishingMap.scss';

const startCenter = {
    lat: 60.314063,
    lng: 24.881883
};

const VIEWPORT_STORAGE_KEY = 'mapViewport';

// Zoom used when framing a single matching location; also the cap when
// fitting a tight cluster, so a search never zooms in uncomfortably far.
const SINGLE_RESULT_ZOOM = 12;

/**
 * Reads the viewport saved by an earlier visit in this session.
 * @returns {{center: {lat: number, lng: number}, zoom: number}|null} The
 * stored viewport, or null when nothing valid is stored.
 */
const readStoredViewport = () => {
    try {
        const stored = JSON.parse(sessionStorage.getItem(VIEWPORT_STORAGE_KEY));
        if (stored
            && typeof stored.lat === 'number'
            && typeof stored.lng === 'number'
            && typeof stored.zoom === 'number') {
            return {
                center: { lat: stored.lat, lng: stored.lng },
                zoom: stored.zoom
            };
        }
    }
    catch {
        // Malformed JSON — treat it the same as nothing stored.
    }
    return null;
};

/**
 * Frames the map around the given location markers: pans and zooms to a
 * single result, or fits the bounds of several (padded, and never zoomed in
 * past SINGLE_RESULT_ZOOM).
 * @param {google.maps.Map} map - The map instance.
 * @param {Array<{position: {latitude: number, longitude: number}}>} locations
 */
const fitToLocations = (map, locations) => {
    if (locations.length === 1) {
        const { latitude, longitude } = locations[0].position;
        map.panTo({ lat: latitude, lng: longitude });
        if (map.getZoom() < SINGLE_RESULT_ZOOM) {
            map.setZoom(SINGLE_RESULT_ZOOM);
        }
        return;
    }

    const bounds = new google.maps.LatLngBounds();
    locations.forEach(l => bounds.extend({
        lat: l.position.latitude,
        lng: l.position.longitude
    }));
    map.fitBounds(bounds, 80);
};

const searchCircleOptions = {
    fillColor: "#0094ff",
    strokeColor: "#0518ee",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0.35,
    draggable: true
};

function FishingMap() {
    const map = useMap();
    const { searchParams, patchParams } = useUrlFilters();

    // Free-text and species filters live in the URL (shared param names with
    // the Locations list, so the view toggle carries them across); the
    // distance/circle mechanism stays in local state.
    const search = searchParams.get('q') ?? '';
    const speciesIds = searchParams.getAll('sIds').map(Number);

    const [distance, setDistance] = useState(0);
    // Id of the location whose info window is open — shared between the
    // markers and the sidebar list so both reflect the same selection.
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [searchCenter, setSearchCenter] = useState(startCenter);
    const [searchOrigin, setSearchOrigin] = useState(null);
    const [speciesOptions, setSpeciesOptions] = useState([]);
    // Read once on mount; the stored viewport only seeds the map's
    // uncontrolled defaultCenter/defaultZoom.
    const [initialViewport] = useState(readStoredViewport);
    const circleRef = useRef();
    // Signature of the marker set the map was last framed to, so an identical
    // refetch doesn't re-run fitBounds.
    const lastFitSignature = useRef(null);

    const [, , currentLocation] = useCurrentUser();

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

    // Persist the viewport so navigating away and back mid-session restores
    // the same view instead of the default: after every pan/zoom settles
    // (also covers page reloads), and once more on unmount in case the user
    // leaves before the idle event fires.
    useEffect(() => {
        if (!map) {
            return;
        }

        /**
         * Stores the map's current center and zoom in session storage.
         */
        const saveViewport = () => {
            const center = map.getCenter();
            if (!center) {
                return;
            }

            sessionStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify({
                lat: center.lat(),
                lng: center.lng(),
                zoom: map.getZoom()
            }));
        };

        const listener = map.addListener('idle', saveViewport);

        return () => {
            listener.remove();
            saveViewport();
        };
    }, [map]);

    // Markers filter live from the current filter values — no submit step.
    const { data: locations, isLoading } = useDebouncedQuery(
        () => locationService.getLocationMarkers(search, speciesIds, distance, searchOrigin),
        [search, JSON.stringify(speciesIds), distance, searchOrigin],
        { initial: [] }
    );

    // A text/species search implies "find these spots", so frame the map on
    // the matches. Distance (the circle) is excluded: the circle already
    // defines its own area, and refitting would fight dragging it.
    const hasSearchFilters = !!search || speciesIds.length > 0;

    // Reframe the map onto the matching markers whenever a text/species
    // search changes the result set — including when the last such filter is
    // removed (or Reset), so clearing zooms back out to frame every marker
    // again. Skipped while loading (so it fits fresh results, not stale ones).
    useEffect(() => {
        if (!map || isLoading) {
            return;
        }

        const signature = locations.map(l => l.id).sort().join(',');

        if (!hasSearchFilters) {
            // No text/species filter active. Only reframe when we had just
            // been framing a filtered set (signature set) and the now-loaded
            // unfiltered set differs — i.e. the filter was cleared. The stale
            // in-between render still carries the old signature so it's skipped
            // here, and on initial load nothing was framed (signature null) so
            // the restored/default viewport is preserved.
            if (lastFitSignature.current !== null && signature !== lastFitSignature.current) {
                lastFitSignature.current = null;
                if (locations.length > 0) {
                    fitToLocations(map, locations);
                }
            }
            return;
        }

        if (locations.length === 0) {
            return;
        }

        if (signature === lastFitSignature.current) {
            return;
        }
        lastFitSignature.current = signature;
        fitToLocations(map, locations);
    }, [map, isLoading, locations, hasSearchFilters]);

    // Drop the selection when its location falls out of the filtered results,
    // so no info window lingers for a marker that no longer exists.
    useEffect(() => {
        if (selectedLocationId != null && !locations.some(l => l.id === selectedLocationId)) {
            setSelectedLocationId(null);
        }
    }, [locations, selectedLocationId]);

    /**
     * Selects a location from the sidebar list: opens its info window and
     * frames the map on it (zooming in if the map is currently zoomed out
     * past the single-result level).
     * @param {Object} location - Marker-shaped location ({id, position}).
     */
    const onPanelSelect = (location) => {
        setSelectedLocationId(location.id);
        if (map) {
            fitToLocations(map, [location]);
        }
    };

    /**
     * Applies a committed distance value (slider release): sizes the search
     * circle, places it at the current map view the first time a radius is
     * set, and updates the query origin from the circle's actual position
     * (which may have been dragged since React last set it).
     * @param {number} value - Radius in km; 0 means no limit.
     */
    const onDistanceCommit = (value) => {
        setDistance(value);

        if (value === 0) {
            setSearchCenter(startCenter);
            setSearchOrigin(null);
            return;
        }

        let center;
        if (map && searchCenter === startCenter) {
            center = map.getCenter();
            setSearchCenter(center);
        }
        else {
            center = circleRef.current.getCenter();
        }
        setSearchOrigin({ latitude: center.lat(), longitude: center.lng() });
    };

    /**
     * Re-runs the marker search from the circle's new position after the
     * user drags it. The circle moves itself on drag; React state only
     * needs the origin used for querying.
     */
    const handleCircleDragEnd = () => {
        const center = circleRef.current.getCenter();
        setSearchOrigin({ latitude: center.lat(), longitude: center.lng() });
    };

    /**
     * Sets the free-text search filter in the URL.
     * @param {string} value - The search term.
     */
    const onSearch = (value) => patchParams({ q: value });

    /**
     * Sets the species filter in the URL.
     * @param {Array<number>} ids - Selected species ids.
     */
    const onSpeciesChange = (ids) => patchParams({ sIds: ids });

    /**
     * Clears every active filter and returns the search circle to its
     * starting position so the map shows all markers again.
     */
    const onReset = () => {
        patchParams({ q: '', sIds: [] });
        setDistance(0);
        setSearchCenter(startCenter);
        setSearchOrigin(null);
    };

    const hasActiveFilters = !!search || speciesIds.length > 0 || distance > 0;

    // Hide the count until the first fetch resolves so the map doesn't flash
    // an empty state on entry. Re-queries keep the previous data, so the
    // status stays visible while filtering.
    const showCount = !isLoading || locations.length > 0;

    const filterControls = (variant) => (
        <>
            <SearchInput
                value={search}
                onChange={onSearch}
                placeholder="Search…"
                ariaLabel="Search locations"
            />
            <MultiSelectInput
                label={variant === 'panel' ? 'Species' : undefined}
                options={speciesOptions}
                value={speciesIds}
                onChange={onSpeciesChange}
                placeholder={variant === 'panel' ? 'Any species…' : 'Species…'}
            />
            <RangeInput
                label={variant === 'panel' ? 'Distance (km)' : 'Distance'}
                value={distance}
                onCommit={onDistanceCommit}
                min={0}
                max={100}
                unit="km"
            />
            {hasActiveFilters && <ResetButton onClick={onReset} />}
        </>
    );

    return (
        <div className="fishing-map page">
            {isLoading && <FloatingSpinner />}

            <SlideInPanel>
                {filterControls('panel')}
            </SlideInPanel>

            <div className="map-filter">
                <div className="container">
                    {filterControls('toolbar')}
                </div>
            </div>

            <div className="map-main">
                <MapLocationsPanel
                    locations={locations}
                    show={showCount}
                    selectedId={selectedLocationId}
                    onSelect={onPanelSelect}
                    currentLocation={currentLocation}
                    hasActiveFilters={hasActiveFilters}
                    onReset={onReset}
                />

                <div className='map-area'>
                    <div className="map-overlay-top">
                        <ViewToggle active="map" />
                        <MapResultStatus
                            count={locations.length}
                            show={showCount}
                            hasActiveFilters={hasActiveFilters}
                            onReset={onReset}
                        />
                    </div>

                    <Map
                        center={initialViewport ? initialViewport.center : startCenter}
                        zoom={initialViewport ? initialViewport.zoom : 8}>
                        <MapTypeControl position={ControlPosition.RIGHT_BOTTOM} />
                        <LocateButton location={currentLocation} />
                        {currentLocation && (
                            <PositionMarker
                                position={{
                                    lat: currentLocation.latitude,
                                    lng: currentLocation.longitude
                                }}
                            />
                        )}

                        <Circle
                            ref={circleRef}
                            center={searchCenter}
                            radius={distance * 1000}
                            circleOptions={searchCircleOptions}
                            onDragEnd={handleCircleDragEnd}
                        />
                        <LocationClusterer
                            locations={locations}
                            selectedLocationId={selectedLocationId}
                            onSelect={setSelectedLocationId}
                        />
                    </Map>
                </div>
            </div>
        </div>
    )
}

export default FishingMap
