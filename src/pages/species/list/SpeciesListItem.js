import React from 'react';
import { Link } from 'react-router-dom';
import './SpeciesListItem.scss';

function SpeciesListItem({ species }) {
    const { id, name, description, images } = species;

    const getImagesSrc = () => {
        if (images && images.length > 0) {
            return `${process.env.REACT_APP_BASE_URL}/${images[0].url}`;
        } else {
            return "images/species/fish.png";
        }
    };

    return (
        <Link to={`/species/${id}`}>
            <div className="species-list-item">
                <div>
                    <img src={getImagesSrc()} alt="The fish" className="species-list-item-image" />
                </div>
                <div className="species-list-item-main">
                    <h3 className="species-list-item-title">{name}</h3>
                    <p className="species-list-item-text">{description}</p>
                </div>
            </div>
        </Link>
    )
}

export default SpeciesListItem
