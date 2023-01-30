import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speciesService } from '../../services/speciesService';
import { fileService } from '../../services/fileService';
import SpeciesForm from './SpeciesForm';
import './EditSpecies.scss';

function EditSpecies() {

    const { id } = useParams();
    const [species, setSpecies] = useState(null);
    const navigate = useNavigate();

    const [speciesImages, setSpeciesImages] = useState([]);

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpeciesById(parseInt(id));
            if (s) {
                setSpecies(s);
            }
        })();
    }, [])

    useEffect(() => {
        (async () => {
            if (species && species.images) {

                const images = [];

                for (let image of species.images) {
                    const imageFile = await fileService.getImage(image.url, image.name);
                    if (imageFile) {
                        images.push(imageFile);
                    }
                }
                
                setSpeciesImages(images);
            }
        })();
    }, [species])

    const handleSubmit = async (values, { setSubmitting }) => {
        console.log(values);
        var response = await speciesService.updateSpecies(
            species.id,
            {
                id: species.id,
                name: values.name,
                description: values.description,
                images: values.images
            });

        if (response) {
            navigate(`/species/${response.id}`);
        }
    }

    const handleDelete = async ($event) => {
        $event.preventDefault();
        if (window.confirm(`Are you sure you want to delete ${species.name}?`)) {
            await speciesService.deleteSpecies(species.id);
            navigate(`/species`);
        }
    }

    return (
        species ? (<div className="edit-species page">
            <div className="container edit-species-container">
                <h1 className="page-title">Edit species</h1>
                <SpeciesForm
                    initialValues={{
                        name: species.name,
                        description: species.description,
                        images: speciesImages
                    }}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    operation='edit'
                />
            </div>
        </div>) : null
    )
}

export default EditSpecies
