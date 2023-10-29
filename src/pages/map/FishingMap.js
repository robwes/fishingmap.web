import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Circle, MarkerClusterer } from '@react-google-maps/api';
import { locationService } from '../../services/locationService';
import LocationMarker from './LocationMarker';
import Map from '../../components/ui/map/Map';
import PositionMarker from '../../components/ui/map/PositionMarker';
import LocationFilter from '../../components/ui/location/LocationFilter';
import SlideInPanel from '../../components/ui/slideInPanel/SlideInPanel';
import FloatingSpinner from '../../components/ui/spinner/FloatingSpinner';
import { useCurrentUser } from '../../context/CurrentUserContext';
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
    radius: 0,
    draggable: true
};

const clustererOptions = {
    gridSize: 50,
    averageCenter: true,
    minimumClusterSize: 8,
    ignoreHidden: true
};

function FishingMap() {
    const [map, setMap] = useState();
    const [locations, setLocations] = useState([]);
    const [searchRadius, setSearchRadius] = useState(0);
    const [searchCenter, setSearchCenter] = useState(startCenter);
    const [isLoading, setIsLoading] = useState(true);
    const circleRef = useRef();

    // eslint-disable-next-line
    const [currentUser, updateCurrentUser, currentLocation] = useCurrentUser();

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocationMarkers();
            if (l) {
                setLocations(l);
            }
            setIsLoading(false);
        })();
    }, []);

    const handleReset = async () => {
        const locations = await locationService.getLocationMarkers();
        if (locations) {
            setLocations(locations);
        }
    }

    const handleSearch = async ({ search, species, distance }, { isSubmitting, setSubmitting, resetForm }) => {
        const searchOrigin = {
            latitude: circleRef.current.state.circle.center.lat(),
            longitude: circleRef.current.state.circle.center.lng()
        };
        const matchingLocations = await locationService.getLocationMarkers(search, species, distance, searchOrigin);
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
            {isLoading && <FloatingSpinner />}

            <div className='left'>
                <SlideInPanel>
                    <LocationFilter
                        onSubmit={handleSearch}
                        onReset={handleReset}
                        onDistanceChange={handleDistanceChange} />
                </SlideInPanel>
            </div>
            <div className='right'>
                <Map
                    center={startCenter}
                    zoom={8}
                    onLoad={handleMapLoad}
                    onUnmount={handleMapUnMount}>
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
                        radius={searchRadius}
                        options={searchCircleOptions}
                        center={searchCenter}
                    />
                    <MarkerClusterer options={clustererOptions}>
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
        </div>
    )
}

export default FishingMap
