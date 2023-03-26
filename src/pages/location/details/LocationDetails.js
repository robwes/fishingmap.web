import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LocationCard from './LocationCard';
import { locationService } from '../../../services/locationService';
import LocationMap from './LocationMap';
import Article from '../../../components/ui/article/Article';
import './LocationDetails.scss';

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

    return (
        location ? (
            <div className="location-details page">
                <div className='left'>
                    <LocationCard location={location} />
                </div>

                <div className='right'>
                    <LocationMap
                        location={location}
                    />
                    <Article
                        className="location-description"
                        title="Information"
                        text={location.description}
                    />
                </div>
            </div>
        ) : null
    )
}

export default LocationDetails
