import React from 'react';
import { Link } from 'react-router-dom';
import LinkItemList from '../../../components/ui//linkItemList/LinkItemList';
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

    const speciesItems = species.map(s => (
        {
            icon: "fas fa-fish",
            text: s.name,
            path: `/species/${s.id}`
        }
    ));

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
                        <LinkItemList items={speciesItems} isLink={false} />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default LocationListItem