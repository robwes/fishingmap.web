import React from 'react';
import { Data } from '@react-google-maps/api';
import LinkButtonPrimaryOutline from '../../../components/ui/buttons/LinkButtonPrimaryOutline';
import Map from '../../../components/ui/map/Map';
import geoUtils from '../../../utils/geoUtils';
import { useCurrentUser } from '../../../context/CurrentUserContext';
import PositionMarker from '../../../components/ui/map/PositionMarker';
import './LocationMap.scss';

const mapStyle = {
    width: '100%',
    height: '650px'
};

function LocationMap({ location }) {

    // eslint-disable-next-line
    const [currentUser, updateCurrentUser, currentLocation] = useCurrentUser();

    const handleDataLoad = data => {
        data.setStyle({
            fillOpacity: 0.0,
            strokeColor: "#3972ce",
            strokeWeight: 4
        });
        const geometry = geoUtils.multiPolygonFeatureToPolygonFeatureCollection(JSON.parse(location.geometry));
        data.addGeoJson(geometry);

        const boundingBox = geoUtils.getBoundingBox(geometry);
        if (boundingBox) {
            data.getMap().fitBounds(boundingBox);
        }
    };

    let directionsLink = "https://www.google.com/maps/dir/?api=1&destination=";
    if (location) {
        directionsLink += encodeURIComponent(`${location.position.latitude},${location.position.longitude}`) + "&travelmode=driving";
    }

    return (
        <div className="location-map">
            <Map
                center={{ lat: location.position.latitude, lng: location.position.longitude }}
                zoom={12}
                mapStyle={mapStyle}>
                <PositionMarker
                    position={{
                        lat: currentLocation.latitude,
                        lng: currentLocation.longitude
                    }}
                />
                <Data
                    onLoad={handleDataLoad}
                />
            </Map>

            <LinkButtonPrimaryOutline
                href={directionsLink}
                target="_blank"
                rel="noreferrer"
                className="location-directions">
                <i className="fas fa-directions"></i> Directions
            </LinkButtonPrimaryOutline>
        </div>
    )
}

export default LocationMap