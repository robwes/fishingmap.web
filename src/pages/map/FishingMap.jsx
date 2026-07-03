import React, { useState, useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { locationService } from '../../services/locationService';
import { speciesService } from '../../services/speciesService';
import Map from '../../components/ui/map/Map';
import LocationClusterer from './LocationClusterer';
import MapTypeControl from './MapTypeControl';
import Circle from '../../components/ui/map/Circle';
import PositionMarker from '../../components/ui/map/PositionMarker';
import SlideInPanel from '../../components/ui/slideInPanel/SlideInPanel';
import SearchInput from '../../components/ui/form/SearchInput';
import MultiSelectInput from '../../components/ui/form/MultiSelectInput';
import RangeInput from '../../components/ui/form/RangeInput';
import ResetButton from '../../components/ui/buttons/ResetButton';
import FloatingSpinner from '../../components/ui/spinner/FloatingSpinner';
import { useCurrentUser } from '../../context/CurrentUserContext';
import useDebouncedQuery from '../../hooks/useDebouncedQuery';
import './FishingMap.scss';

const startCenter = {
    lat: 60.314063,
    lng: 24.881883
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
    const [search, setSearch] = useState('');
    const [speciesIds, setSpeciesIds] = useState([]);
    const [distance, setDistance] = useState(0);
    const [searchCenter, setSearchCenter] = useState(startCenter);
    const [searchOrigin, setSearchOrigin] = useState(null);
    const [speciesOptions, setSpeciesOptions] = useState([]);
    const circleRef = useRef();

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

    // Markers filter live from the current filter values — no submit step.
    const { data: locations, isLoading } = useDebouncedQuery(
        () => locationService.getLocationMarkers(search, speciesIds, distance, searchOrigin),
        [search, JSON.stringify(speciesIds), distance, searchOrigin],
        { initial: [] }
    );

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
     * Clears every active filter and returns the search circle to its
     * starting position so the map shows all markers again.
     */
    const onReset = () => {
        setSearch('');
        setSpeciesIds([]);
        setDistance(0);
        setSearchCenter(startCenter);
        setSearchOrigin(null);
    };

    const hasActiveFilters = !!search || speciesIds.length > 0 || distance > 0;

    const filterControls = (variant) => (
        <>
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search locations…"
                ariaLabel="Search locations"
            />
            <MultiSelectInput
                label={variant === 'panel' ? 'Species' : undefined}
                options={speciesOptions}
                value={speciesIds}
                onChange={setSpeciesIds}
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

            <div className='map-area'>
                <Map
                    center={startCenter}
                    zoom={8}>
                    <MapTypeControl />
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
                    <LocationClusterer locations={locations} />
                </Map>
            </div>
        </div>
    )
}

export default FishingMap
