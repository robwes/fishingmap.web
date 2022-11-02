import React from 'react'
import { Link } from 'react-router-dom'

function SpeciesListItem({ species }) {
    const { id, name, description, images } = species;

    const getImagesSrc = () => {
        if (images && images.length > 0) {
            return `${process.env.REACT_APP_BASE_URL}/${images[0].url}`;
        } else {
            return "images/species/default.jpg";
        }
    };

    return (
        <Link to={`/species/${id}`}>
            <div className="grid-item">
                <div>
                    <img src={getImagesSrc()} alt="The fish" className="grid-item-image" />
                </div>
                <div className="grid-item-main">
                    <h3 className="grid-item-title">{name}</h3>
                    <p className="grid-item-text">{description}</p>
                </div>
            </div>
        </Link>
    )
}

export default SpeciesListItem
