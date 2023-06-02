import React from 'react';
import { Link } from 'react-router-dom';
import { SecureLink } from 'react-secure-link';
import Collapse from '../../../components/ui/collapse/Collapse';
import ImageCarousell from '../../../components/ui/imageCarousell/ImageCarousell';
import Article from '../../../components/ui/article/Article';
import LocationSpeciesItem from '../../../components/ui/location/LocationSpeciesItem';
import LocationPermitItem from './LocationPermitItem';
import lake from '../../../assets/images/lake.png';
import './LocationCard.scss';

function LocationCard({ location }) {

    const getImages = () => {
        const images = [];

        if (location && location.images.length > 0) {
            location.images.forEach(image => {
                images.push({
                    url: `${process.env.REACT_APP_IMAGES_URL}/${image.path}`,
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
            <Link to={`/species/${s.id}`}>
                <LocationSpeciesItem
                    key={s.id}
                    species={s}
                />
            </Link>
        ));
    }

    const getPermits = () => {
        return location.permits.map(p => (
            <SecureLink
                href={p.url}
                target="_blank"
                rel="noreferrer">
                <LocationPermitItem
                    key={p.id}
                    permit={p}
                />
            </SecureLink>
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
            <Article
                className="location-card-footer"
                title="Rules"
                text={location?.rules}
            />
        </div>
    )
}

export default LocationCard