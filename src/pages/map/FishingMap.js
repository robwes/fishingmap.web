import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Circle, MarkerClusterer } from '@react-google-maps/api';
import { locationService } from '../../services/locationService';
import LocationMarker from './LocationMarker';
import Map from '../../components/ui/map/Map';
import LocationFilter from '../../components/ui/location/LocationFilter';
import SlideInPanel from '../../components/ui/slideInPanel/SlideInPanel';
import './FishingMap.scss';

const startCenter = {
    lat: 60.2,
    lng: 23.5
};

const searchCircleOptions = {
    fillColor: "#0094ff",
    strokeColor: "#0518ee",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0.35,
    radius: 0,
    draggable: true
}

function FishingMap() {
    const [locations, setLocations] = useState([]);
    const [searchRadius, setSearchRadius] = useState(0);
    const [map, setMap] = useState();
    const [searchCenter, setSearchCenter] = useState(startCenter);
    const circleRef = useRef();

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocations();
            if (l) {
                setLocations(l);
            }
        })();
    }, []);

    const handleReset = async () => {
        const locations = await locationService.getLocations();
        if (locations) {
            setLocations(locations);
        }
    }

    const handleSearch = async ({ search, species, distance }, { setSubmitting, resetForm }) => {
        const searchOrigin = {
            latitude: circleRef.current.state.circle.center.lat(),
            longitude: circleRef.current.state.circle.center.lng()
        };
        const matchingLocations = await locationService.getLocations(search, species, distance, searchOrigin);
        if (matchingLocations) {
            setLocations(matchingLocations);
        }
    }

    const handleDistanceChange = (value) => {
        setSearchRadius(value * 1000);

        if (value === 0 && searchCenter !== startCenter) {
            setSearchCenter(startCenter);
        }
        else if (map && searchCenter === startCenter) {
            setSearchCenter(map.getCenter());
        }
    }

    const handleMapLoad = useCallback((mapObject) => {
        mapObject.panTo(startCenter);
        setMap(mapObject);
    }, []);

    const handleMapUnMount = useCallback((map) => {
        setMap(null);
    }, []);

    return (
        <div className="fishing-map page">
            <SlideInPanel isFloating={true}>
                <LocationFilter
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    onDistanceChange={handleDistanceChange} />
            </SlideInPanel>
            <Map
                center={startCenter}
                zoom={8}
                onLoad={handleMapLoad}
                onUnmount={handleMapUnMount}>
                <Circle
                    ref={circleRef}
                    radius={searchRadius}
                    options={searchCircleOptions}
                    center={searchCenter} />
                <MarkerClusterer>
                    {(clusterer) =>
                        locations.map((location) => (
                            <LocationMarker key={location.id}
                                location={location}
                                clusterer={clusterer} />
                        ))
                    }
                </MarkerClusterer>
            </Map>
        </div>
    )
}

export default FishingMap
