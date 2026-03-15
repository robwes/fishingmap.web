import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LocationCard from './LocationCard';
import { locationService } from '../../../services/locationService';
import LocationMap from './LocationMap';
import Article from '../../../components/ui/article/Article';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import './LocationDetails.scss';

function LocationDetails() {

    const { id } = useParams();
    const [location, setLocation] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocation(parseInt(id));
            if (l) {
                setLocation(l);
            }
            setIsLoading(false);
        })();
    }, [id]);

    return (
        <div className="location-details page">
            {isLoading && <FloatingSpinner />}
            {location && <>
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
            </>}
        </div>
    )
}

export default LocationDetails
