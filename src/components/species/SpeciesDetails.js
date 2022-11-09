import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { speciesService } from '../../services/speciesService'
import ImageCarousell from '../common/ImageCarousell';
import './species.css'

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
            debugger;
            species.images.forEach(image => {
                images.push({
                    url: `${process.env.REACT_APP_BASE_URL}/${image.url}`,
                    description: species.name
                });
            });
        } else {
            images.push({
                url: "../images/species/default.jpg",
                description: "Default species image"
            });
        }

        return images;
    }

    return (
        <div className="species-details">
            {species ? (
                <div className="container">
                    <div className="species-details-card">
                        <ImageCarousell images={getImages()} cssClass="species-details-image" />
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
