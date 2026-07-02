import React, { useState, useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { locationService } from '../../services/locationService';
import Map from '../../components/ui/map/Map';
import LocationClusterer from './LocationClusterer';
import MapTypeControl from './MapTypeControl';
import Circle from '../../components/ui/map/Circle';
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
    draggable: true
};

function FishingMap() {
    const map = useMap();
    const [locations, setLocations] = useState([]);
    const [searchRadius, setSearchRadius] = useState(0);
    const [searchCenter, setSearchCenter] = useState(startCenter);
    const [isLoading, setIsLoading] = useState(true);
    const circleRef = useRef();

    const [, , currentLocation] = useCurrentUser();

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

    const handleSearch = async ({ search, species, distance }) => {
        const searchOrigin = {
            latitude: circleRef.current.center.lat(),
            longitude: circleRef.current.center.lng()
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

    return (
        <div className="fishing-map page">
            {isLoading && <FloatingSpinner />}

            <SlideInPanel isFloating>
                <LocationFilter
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    onDistanceChange={handleDistanceChange}
                    resultCount={locations.length} />
            </SlideInPanel>
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
                        radius={searchRadius}
                        circleOptions={searchCircleOptions}
                    />
                    <LocationClusterer locations={locations} />
                </Map>
            </div>
        </div>
    )
}

export default FishingMap
