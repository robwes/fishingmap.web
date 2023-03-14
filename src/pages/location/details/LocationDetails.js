import React, { useState, useEffect } from 'react';
import { Data } from '@react-google-maps/api';
import { useParams } from 'react-router-dom';
import LocationCard from './LocationCard';
import LinkButtonPrimaryOutline from '../../../components/ui/buttons/LinkButtonPrimaryOutline';
import Map from '../../../components/ui/map/Map';
import geoUtils from '../../../utils/geoUtils';
import { locationService } from '../../../services/locationService';
import './LocationDetails.scss';

const mapStyle = {
    width: '100%',
    height: '650px'
};

function LocationDetails() {

    const { id } = useParams();
    const [location, setLocation] = useState();

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocation(parseInt(id));
            if (l) {
                setLocation(l);
            }
        })();
    }, [id]);

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
        location ? (
            <div className="location-details container page">
                <div className="location-details-body">
                    <h1 className="location-details-title">{location.name}</h1>
                    <LocationCard location={location} />
                    <div className="location-position">
                        <Map
                            center={{ lat: location.position.latitude, lng: location.position.longitude }}
                            zoom={12}
                            mapStyle={mapStyle}>
                            <Data
                                onLoad={handleDataLoad}
                            />
                        </Map>
                    </div>
                </div>

                <LinkButtonPrimaryOutline
                    href={directionsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="location-directions pull-right">
                    <i className="fas fa-directions"></i> Directions
                </LinkButtonPrimaryOutline>
            </div>
        ) : null
    )
}

export default LocationDetails
