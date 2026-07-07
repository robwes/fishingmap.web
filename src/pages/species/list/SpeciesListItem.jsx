import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/card/Card';
import CardImage from '../../../components/ui/card/CardImage';
import CardTitle from '../../../components/ui/card/CardTitle';
import CardBody from '../../../components/ui/card/CardBody';
import { fileService } from '@/shared/services/fileService';
import './SpeciesListItem.scss';

/**
 * Card for a single species in the species grid. Shows the species' uploaded
 * photo when one exists, otherwise a Font Awesome icon-tile placeholder, plus
 * the name, italic scientific name (when present) and description. Lifts on hover.
 * @param {{ species: { id: number, name: string, scientificName?: string, description?: string, images?: Array } }} props
 */
function SpeciesListItem({ species }) {
    const { id, name, scientificName, description, images } = species;
    const photo = images && images.length > 0
        ? fileService.getImageUrl(images[0].path)
        : null;

    return (
        <Link to={`/species/${id}`}>
            <Card className="species-list-item">
                {photo
                    ? <CardImage src={photo} alt={name} />
                    : (
                        <div className="species-list-item-placeholder">
                            <i className="fas fa-fish" aria-hidden="true" />
                        </div>
                    )}
                <CardBody>
                    <CardTitle>{name}</CardTitle>
                    {scientificName && <p className="sli-scientific">{scientificName}</p>}
                    <p>{description}</p>
                </CardBody>
            </Card>
        </Link>
    );
}

export default SpeciesListItem;
