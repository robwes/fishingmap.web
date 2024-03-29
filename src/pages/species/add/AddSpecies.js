import React from 'react';
import  { useNavigate } from 'react-router-dom';
import { speciesService } from '../../../services/speciesService';
import SpeciesForm from '../../../components/ui/species/SpeciesForm';
import './AddSpecies.scss';

function AddSpecies() {

    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting }) => {
        var response = await speciesService.createSpecies({
            name: values.name,
            description: values.description,
            images: values.images
        });

        if (response) {
            navigate(`/species/${response.id}`);
        }
    }

    return (
        <div className="add-species page">
            <div className="container add-species-container">
                <h1 className="page-title">Add species</h1>
                <SpeciesForm
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}

export default AddSpecies
