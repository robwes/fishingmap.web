import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/card/Card';
import CardImage from '../../../components/ui/card/CardImage';
import CardTitle from '../../../components/ui/card/CardTitle';
import CardBody from '../../../components/ui/card/CardBody';
import fish from '../../../assets/images/fish.png';
import './SpeciesListItem.scss';

function SpeciesListItem({ species }) {
    const { id, name, description, images } = species;

    const getImagesSrc = () => {
        if (images && images.length > 0) {
            return `${process.env.REACT_APP_IMAGES_URL}/${images[0].path}`;
        } else {
            return fish;
        }
    };

    return (
        <Link to={`/species/${id}`}>
            <Card className="species-list-item">
                <CardImage src={getImagesSrc()} alt={name} />
                <CardBody>
                    <CardTitle>{name}</CardTitle>
                    <p>{description}</p>
                </CardBody>
            </Card>
        </Link>
    )
}

export default SpeciesListItem
