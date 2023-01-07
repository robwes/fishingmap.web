import React from 'react';
import  { useNavigate } from 'react-router-dom';
import { speciesService } from '../../services/speciesService';
import SpeciesForm from './SpeciesForm';
import './species.css';

function AddSpecies() {

    const navigate = useNavigate();
    const initialValues = { name: "", description: "" };

    const handleSubmit = async (values, { setSubmitting }) => {
        console.log(values);
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
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}

export default AddSpecies
