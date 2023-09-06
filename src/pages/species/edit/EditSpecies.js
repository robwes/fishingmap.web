import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speciesService } from '../../../services/speciesService';
import SpeciesForm from '../../../components/ui/species/SpeciesForm';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import './EditSpecies.scss';

function EditSpecies() {

    const { id } = useParams();
    const [species, setSpecies] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpeciesById(parseInt(id));
            if (s) {
                setSpecies(s);
            }
            setIsLoading(false);
        })();
        // eslint-disable-next-line
    }, [])

    const handleSubmit = async (values, { setSubmitting }) => {
        debugger;
        var response = await speciesService.updateSpecies(
            species.id,
            {
                id: species.id,
                ...values
            });

        if (response) {
            navigate(`/species/${response.id}`);
        }
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${species.name}?`)) {
            await speciesService.deleteSpecies(species.id);
            navigate(`/species`);
        }
    }

    return (
        <div className="edit-species page">
            {isLoading && <FloatingSpinner />}

            {species && (
                <div className="container edit-species-container">
                    <h1 className="page-title">Edit species</h1>
                    <SpeciesForm
                        species={species}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                    />
                </div>
            )}
        </div>
    )
}

export default EditSpecies
