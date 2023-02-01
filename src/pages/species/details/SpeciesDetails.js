import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { speciesService } from '../../../services/speciesService';
import ImageCarousell from '../../../components/ui/imageCarousell/ImageCarousell';
import './SpeciesDetails.scss';

function SpeciesDetails() {

    const { id } = useParams();
    const [species, setSpecies] = useState(null);

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpeciesById(parseInt(id));
            if (s) {
                setSpecies(s);
            }
        })();
    }, [id])

    const getImages = () => {
        const images = [];

        if (species && species.images.length > 0) {
            species.images.forEach(image => {
                images.push({
                    url: `${process.env.REACT_APP_BASE_URL}/${image.url}`,
                    description: species.name
                });
            });
        } else {
            images.push({
                url: "../images/species/fish.png",
                description: "Default species image"
            });
        }

        return images;
    }

    return (
        <div className="species-details page">
            {species ? (
                <div className="container center-content">
                    <div className="species-details-card">
                        <ImageCarousell images={getImages()} className="species-details-image" />
                        <div className="species-details-info">
                            <h1 className="center-text">{species.name}</h1>
                            <p className="species-details-description">{species.description}</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default SpeciesDetails
