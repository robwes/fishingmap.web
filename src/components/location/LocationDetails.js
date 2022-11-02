import { Data } from '@react-google-maps/api';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { locationService } from '../../services/locationService'
import Collapse from '../common/Collapse';
import LinkItemList from '../common/LinkItemList';
import Map from '../map-components/Map'
import ImageCarousell from '../common/ImageCarousell';

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
        const geometry = { "type": "FeatureCollection", "features": [JSON.parse(location.geometry)] }
        data.addGeoJson(geometry);
    };

    const getImages = () => {
        const images = [];

        if (location && location.images.length > 0) {
            location.images.forEach(image => {
                images.push({
                    url: `${process.env.REACT_APP_BASE_URL}/${image.url}`,
                    description: location.name
                });
            });
        } else {
            images.push({
                url: "../images/locations/default.jpg",
                description: "Default location image"
            });
        }

        return images;
    }

    const speciesLinkItems = location ? location.species.map(s => (
        {
            icon: "fas fa-fish",
            text: s.name,
            path: `/species/${s.id}`
        }
    )) : [];

    let directionsLink = "https://www.google.com/maps/dir/?api=1&destination=";
    if (location) {
        directionsLink += encodeURIComponent(`${location.position.latitude},${location.position.longitude}`) + "&travelmode=driving";
    }

    return (
        location ? (
            <div className="location-details container container-body">
                <div className="location-body">
                    <h1 className="location-title">{location.name}</h1>
                    <div className="location-card">
                        <ImageCarousell images={getImages()} cssClass="card-image" />
                        <div className="card-body">
                            <div className="input-group">
                                <Collapse label="Species" open={true}>
                                    <LinkItemList items={speciesLinkItems} />
                                </Collapse>
                            </div>
                            <div className="input-group">
                                <Collapse label="Rules">
                                    {location.rules}
                                </Collapse>
                            </div>
                            <div className="input-group">
                                <Collapse label="Fishing License">
                                    {location.licenseInfo}
                                </Collapse>
                            </div>
                            <div className='input-group'>
                                <Collapse label="Description" open={true}>
                                    {location.description}
                                </Collapse>
                            </div>
                        </div>
                    </div>
                    <div className="location-position">
                        <Map center={{ lat: location.position.latitude, lng: location.position.longitude }} zoom={12}>
                            <Data
                                onLoad={handleDataLoad}
                            />
                        </Map>
                    </div>
                </div>
                <a href={directionsLink} target="_blank" rel="noreferrer" className="location-directions button button-primary-outline pull-right"><i className="fas fa-directions"></i> Directions</a>
            </div>
        ) : null
    )
}

export default LocationDetails
