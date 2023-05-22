import React from 'react';
import Collapse from '../../../components/ui/collapse/Collapse';
import LinkItemList from '../../../components/ui/linkItemList/LinkItemList';
import ImageCarousell from '../../../components/ui/imageCarousell/ImageCarousell';
import Article from '../../../components/ui/article/Article';
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

    const speciesLinkItems = location ? location.species.map(s => (
        {
            icon: "fa-solid fa-fish",
            text: s.name,
            path: `/species/${s.id}`
        }
    )) : [];

    const permitLinkItems = location ? location.permits.map(p => (
        {
            icon: "fa-solid fa-file-lines",
            text: p.name,
            url: p.url
        }
    )) : [];

    return (
        <div className="location-card">
            <ImageCarousell images={getImages()} className="location-card-image" />
            <h3 className='location-card-title'>
                {location.name}
            </h3>
            <div className="location-card-body">
                <Collapse label="Species" open={true}>
                    <LinkItemList items={speciesLinkItems} />
                </Collapse>
                <Collapse label="Permits" open={true}>
                    <LinkItemList items={permitLinkItems} />
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