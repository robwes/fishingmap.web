import React from 'react';
import { Link } from 'react-router-dom';
import Collapse from '@/shared/components/collapse/Collapse';
import ImageCarousell from '@/shared/components/imageCarousell/ImageCarousell';
import LocationSpeciesItem from '@/shared/components/location/LocationSpeciesItem';
import LocationPermitItem from './LocationPermitItem';
import CollapsibleArticlePrimary from '@/features/locations/components/CollapsibleArticlePrimary';
import lake from '@/assets/images/lake.png';
import { fileService } from '@/shared/services/fileService';
import './LocationCard.scss';

function LocationCard({ location }) {

    const getImages = () => {
        const images = [];

        if (location && location.images.length > 0) {
            location.images.forEach(image => {
                images.push({
                    url: fileService.getImageUrl(image.path),
                    description: location.name
                });
            });
        } else {
            images.push({
                url: lake,
                description: "Default location image"
            });
        }

        return images;
    }

    const getSpecies = () => {
        return location.species.map(s => (
            <Link
                key={s.id}
                to={`/species/${s.id}`}>
                <LocationSpeciesItem
                    species={s}
                />
            </Link>
        ));
    }

    const getPermits = () => {
        return location.permits.map(p => (
            <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer">
                <LocationPermitItem
                    permit={p}
                />
            </a>
        ));
    }

    return (
        <div className="location-card">
            <ImageCarousell images={getImages()} className="location-card-image" />
            <h3 className='location-card-title'>
                {location.name}
            </h3>
            <div className="location-card-body">

                <Collapse label="Species" open={true}>
                    <div className="location-species-list">
                        {getSpecies()}
                    </div>
                </Collapse>

                <Collapse label="Permits" open={true}>
                    <div className='location-permit-list'>
                        {getPermits()}
                    </div>
                </Collapse>
            </div>
            <CollapsibleArticlePrimary
                className="location-card-footer"
                title="Rules"
                text={location?.rules}
            />
        </div>
    )
}

export default LocationCard
