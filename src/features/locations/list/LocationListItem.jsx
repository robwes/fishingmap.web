import React from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '@/shared/components/location/LocationSpeciesItem';
import LocationImagePlaceholder from '@/shared/components/location/LocationImagePlaceholder';
import CardImage from '@/shared/components/card/CardImage';
import CardBody from '@/shared/components/card/CardBody';
import CardTitle from '@/shared/components/card/CardTitle';
import InlineCard from '@/features/locations/components/InlineCard';
import { fileService } from '@/shared/services/fileService';
import './LocationListItem.scss';

function LocationListItem({ location }) {
    const { id, name, description, species, images, distance } = location;
    const photo = images && images.length > 0
        ? fileService.getImageUrl(images[0].path)
        : null;

    return (
        <Link to={`/locations/${id}`}>
            <InlineCard className="location-list-item">
                <div className="location-list-item-figure">
                    {photo
                        ? <CardImage src={photo} alt={name} />
                        : <LocationImagePlaceholder />}
                    {distance != null && (
                        <span className="location-list-item-distance">
                            <i className="fas fa-location-dot" />{distance} km
                        </span>
                    )}
                </div>
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
