import React from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../components/ui/location/LocationSpeciesItem';
import './LocationInfoWindow.scss';

function LocationInfoWindow({ location }) {

    const getSpecies = () => {
        return location.species.map(s => (
            <LocationSpeciesItem
                key={s.id}
                species={s}
            />
        ));
    }

    return (
        <div className="location-info-window">
            <Link to={`/locations/${location.id}`}>
                <h3 className='location-info-window-title'>
                    {location.name}
                </h3>

                <div className="location-species-list">
                    {getSpecies()}
                </div>
            </Link>
        </div>
    )
}

export default LocationInfoWindow