import React, { useState, useEffect, useRef } from 'react';
import { Circle, MarkerClusterer } from '@react-google-maps/api';
import { locationService } from '../../services/locationService';
import LocationMarker from './LocationMarker';
import Map from '../map-components/Map';
import LocationFilter from './LocationFilter';
import SlideInPanel from '../common/SlideInPanel';
import './FishingMap.scss';

const center = {
    lat: 60.2,
    lng: 23.5
};

const searchCircleOptions = {
    center: center,
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
    }

    return (
        <div className="fishing-map page">
            <SlideInPanel isFloating={true}>
                <LocationFilter
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    onDistanceChange={handleDistanceChange} />
            </SlideInPanel>
            <Map center={center} zoom={8}>
                <Circle
                    ref={circleRef}
                    radius={searchRadius}
                    options={searchCircleOptions} />
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
