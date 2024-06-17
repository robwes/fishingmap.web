import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import LinkButtonPrimaryOutline from '../../../components/ui/buttons/LinkButtonPrimaryOutline';
import Map from '../../../components/ui/map/Map';
import geoUtils from '../../../utils/geoUtils';
import { useCurrentUser } from '../../../context/CurrentUserContext';
import PositionMarker from '../../../components/ui/map/PositionMarker';
import './LocationMap.scss';

const mapStyle = {
    width: '100%',
    height: '100%'
};

function LocationMap({ location }) {
    const map = useMap();

    // eslint-disable-next-line
    const [currentUser, updateCurrentUser, currentLocation] = useCurrentUser();

    // initialize the map
    useEffect(() => {
        if (!map) {
            return;
        }

        const data = map.data;
        data.setStyle({
            fillOpacity: 0.0,
            strokeColor: "#3972ce",
            strokeWeight: 4
        });

        const geometry = geoUtils.multiPolygonFeatureToPolygonFeatureCollection(JSON.parse(location.geometry));
        data.addGeoJson(geometry);

        const boundingBox = geoUtils.getBoundingBox(geometry);
        if (boundingBox) {
            map.fitBounds(boundingBox);
        }
        // eslint-disable-next-line
    }, [map]);

    let directionsLink = "https://www.google.com/maps/dir/?api=1&destination=";
    if (location) {
        directionsLink += encodeURIComponent(`${location.position.latitude},${location.position.longitude}`) + "&travelmode=driving";
    }

    return (
        <div className='location-map'>
            <Map
                center={{ lat: location.position.latitude, lng: location.position.longitude }}
                zoom={12}
                mapStyle={mapStyle}>
                {currentLocation && (
                    <PositionMarker
                        position={{
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude
                        }}
                    />
                )}
            </Map>

            <LinkButtonPrimaryOutline
                href={directionsLink}
                target="_blank"
                rel="noreferrer"
                className="location-directions">
                <i className="fas fa-directions"></i> Directions
            </LinkButtonPrimaryOutline>
        </div>
    );
}

export default LocationMap;