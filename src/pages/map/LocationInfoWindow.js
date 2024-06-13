import React from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../components/ui/location/LocationSpeciesItem';
import { InfoWindow } from '@vis.gl/react-google-maps';
import './LocationInfoWindow.scss';

const LocationInfoWindow = ({ location, onClose }) => {
    const { latitude, longitude } = location.position;

    const getSpecies = () => {
        return location.species.map(s => (
            <LocationSpeciesItem
                key={s.id}
                species={s}
            />
        ));
    }

    return (
        <InfoWindow
            pixelOffset={[0, -47]}
            position={{ lat: latitude, lng: longitude }}
            onClose={onClose}
        >
            <div className='location-info-window'>
                <Link to={`/locations/${location.id}`}>
                    <h3 className='location-info-window-title'>
                        {location.name}
                    </h3>

                    <div className="location-species-list">
                        {getSpecies()}
                    </div>
                </Link>
            </div>
        </InfoWindow>
    );
};

export default LocationInfoWindow;