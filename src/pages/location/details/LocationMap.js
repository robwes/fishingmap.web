import React from 'react';
import { Data } from '@react-google-maps/api';
import LinkButtonPrimaryOutline from '../../../components/ui/buttons/LinkButtonPrimaryOutline';
import Map from '../../../components/ui/map/Map';
import geoUtils from '../../../utils/geoUtils';
import './LocationMap.scss';

const mapStyle = {
    width: '100%',
    height: '650px'
};

function LocationMap({location}) {

    const handleDataLoad = data => {
        data.setStyle({
            fillColor: "#4285f4",
            strokeColor: "#4285f4",
            strokeWeight: 5
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