import React from 'react';
import './LocationSpeciesItem.scss';

function LocationSpeciesItem({ species }) {
    return (
        <span className="location-species-item">
            <i className="fa-solid fa-fish"></i>
            {species.name}
        </span>
    )
}

export default LocationSpeciesItem;
