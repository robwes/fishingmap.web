import React from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../../components/ui/location/LocationSpeciesItem';
import CardImage from '../../../components/ui/card/CardImage';
import CardBody from '../../../components/ui/card/CardBody';
import CardTitle from '../../../components/ui/card/CardTitle';
import InlineCard from '../../../components/ui/card/InlineCard';
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
            <InlineCard className="location-list-item">
                <CardImage src={getImagesSrc()} alt={name} />
                <CardBody>
                    <CardTitle>{name}</CardTitle>
                    <p>{description}</p>
                    <div className='location-species-list'>
                        {species.map(s => (
                            <LocationSpeciesItem
                                key={s.id}
                                species={s}
                            />
                        ))}
                    </div>
                </CardBody>
            </InlineCard>
        </Link>
    )
}

export default LocationListItem