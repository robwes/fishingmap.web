import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { speciesService } from '@/shared/services/speciesService';
import { fileService } from '@/shared/services/fileService';
import ImageCarousell from '../../../components/ui/imageCarousell/ImageCarousell';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import NotFoundMessage from '../../../components/ui/notFound/NotFoundMessage';
import './SpeciesDetails.scss';

function SpeciesDetails() {

    const { id } = useParams();
    const [species, setSpecies] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpeciesById(parseInt(id));
            if (s) {
                setSpecies(s);
            }
            setIsLoading(false);
        })();
    }, [id])

    const hasImages = !!(species && species.images.length > 0);

    const getImages = () => {
        return species.images.map(image => ({
            url: fileService.getImageUrl(image.path),
            description: species.name
        }));
    }

    return (
        <div className="species-details page">
            {isLoading && <FloatingSpinner />}

            {!isLoading && !species && (
                <NotFoundMessage
                    message="This species could not be loaded. It may have been removed."
                    linkTo="/species"
                    linkText="Back to species"
                />
            )}

            {species && (
                <article className="species-details-content">
                    <div className={`species-details-figure${hasImages ? '' : ' is-placeholder'}`}>
                        {hasImages
                            ? <ImageCarousell images={getImages()} className="species-details-figure-image" />
                            : <i className="fas fa-fish species-details-glyph" aria-hidden="true" />}
                    </div>
                    <h1 className="species-details-title">{species.name}</h1>
                    {species.scientificName && (
                        <p className="species-details-scientific">{species.scientificName}</p>
                    )}
                    <p className="species-details-description">{species.description}</p>
                </article>
            )}
        </div>
    )
}

export default SpeciesDetails
