import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speciesService } from '../../../services/speciesService';
import SpeciesForm from '../../../components/ui/species/SpeciesForm';
import './EditSpecies.scss';

function EditSpecies() {

    const { id } = useParams();
    const [species, setSpecies] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpeciesById(parseInt(id));
            if (s) {
                setSpecies(s);
            }
        })();
        // eslint-disable-next-line
    }, [])

    const handleSubmit = async (values, { setSubmitting }) => {
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
                    species={species}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                />
            </div>
        </div>) : null
    )
}

export default EditSpecies
