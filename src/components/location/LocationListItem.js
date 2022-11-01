import React from 'react'
import { Link } from 'react-router-dom'
import LinkItemList from '../common/LinkItemList';

const baseUrl = `https://localhost:7299`;

function LocationListItem({ location }) {
    const { id, name, description, species, images } = location;

    const getImagesSrc = () => {
        if (images && images.length > 0) {
            return `${baseUrl}/${images[0].url}`;
        } else {
            return "images/locations/default.jpg";
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
            <div className="list-item">
                <div className="list-item-image-container">
                    <img src={getImagesSrc()} alt="The lake" className="list-item-image" />
                </div>
                <div className="list-item-main">
                    <h3 className="list-item-title">
                        {name}
                    </h3>
                    <p className="list-item-text">{description}</p>
                    <div className="list-item-footer">
                        <LinkItemList items={speciesItems} isLink={false} />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default LocationListItem