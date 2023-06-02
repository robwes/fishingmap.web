import React from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../../components/ui/location/LocationSpeciesItem';
import lake from '../../../assets/images/lake.png';
import './LocationListItem.scss';

function LocationListItem({ location }) {
    const { id, name, description, species, images } = location;

    const getImagesSrc = () => {
        if (images && images.length > 0) {
            return `${process.env.REACT_APP_IMAGES_URL}/${images[0].path}`;
        } else {
            return lake;
        }
    };

    return (
        <Link to={`/locations/${id}`}>
            <div className="location-list-item">
                <div className="location-list-item-image-container">
                    <img src={getImagesSrc()} alt="The lake" className="location-list-item-image" />
                </div>
                <div className="location-list-item-main">
                    <h3 className="location-list-item-title">
                        {name}
                    </h3>
                    <p className="location-list-item-text">{description}</p>
                    <div className="location-list-item-footer">
                        <div className='location-species-list'>
                            {species.map(s => (
                                <LocationSpeciesItem species={s} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default LocationListItem