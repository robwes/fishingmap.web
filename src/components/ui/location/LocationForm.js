import React from 'react';
import * as Yup from 'yup';
import Form from "../form/Form";
import MapInput from '../form/MapInput';
import ButtonBar from '../buttons/ButtonBar';
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonSuccess from '../buttons/ButtonSuccess';
import LocationFormCard from './LocationFormCard';
import ArticleInput from '../form/ArticleInput';
import './LocationForm.scss';

function LocationForm({ initialValues, title, speciesOptions, mapOptions, onSubmit, onDelete, operation = "add" }) {

    const formValidation = Yup.object({
        name: Yup.string()
            .max(30, "Max 30 characters")
            .required("Required"),
        description: Yup.string()
            .max(1000, "Max 1000 characters")
            .nullable(),
        rules: Yup.string()
            .max(1000, "Max 1000 characters")
            .nullable(),
        geometry: Yup.object().required("Required")
    });

    const formSubmitted = async ({ species, ...rest }, formikBag) => {
        const location = {
            species: species.map(s => ({ id: s.value })),
            ...rest
        };

        await onSubmit(location, formikBag);
    }

    const onDeleteClick = async ($event) => {
        $event.preventDefault();
        await onDelete();
    }

    let buttons;
    if (operation === "add") {
        buttons = <ButtonSuccess type="submit">Add</ButtonSuccess>;
    } else if (operation === "edit") {
        buttons = <>
            <ButtonSecondary onClick={onDeleteClick}>Delete</ButtonSecondary>
            <ButtonSuccess type="submit">Save</ButtonSuccess>
        </>;
    }

    return (
        <Form
            initialValues={initialValues}
            validationSchema={formValidation}
            onSubmit={formSubmitted}
        >
            <div className="location-form">
                <div className='left'>
                    <LocationFormCard
                        initialValues={initialValues}
                        speciesOptions={speciesOptions}
                    />
                </div>
                <div className='right'>
                    <MapInput
                        className="location-form-position"
                        name="geometry"
                        options={mapOptions}
                    />
                    <ArticleInput
                        className='location-form-description'
                        label='Information'
                        name='description'
                        rows={15}
                    />
                    <ButtonBar>
                        {buttons}
                    </ButtonBar>
                </div>
            </div>
        </Form>
    )
}

export default LocationForm
