import React from 'react';
import * as Yup from 'yup';
import Form from "../form/Form";
import Input from '../form/Input';
import MultiSelect from '../form/MultiSelect';
import DragAndDropImage from '../form/DragAndDropImage';
import MapInput from '../form/MapInput';
import CollapsibleTextarea from '../form/CollapsibleTextarea';
import ButtonBar from '../buttons/ButtonBar';
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonSuccess from '../buttons/ButtonSuccess';
import './LocationForm.scss';

function LocationForm({ initialValues, title, speciesOptions, mapOptions, onSubmit, onDelete, operation = "add" }) {

    const formValidation = Yup.object({
        name: Yup.string()
            .max(30, "Max 30 characters")
            .required("Required"),
        description: Yup.string()
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
                <h1 className="location-form-title">{title}</h1>
                <div className="location-form-card">
                    <DragAndDropImage
                        text="Add some images"
                        name="images"
                        maxNrOfFiles={5}
                        className="location-form-card-image"
                        initialValue={initialValues.images}
                    />
                    <div className="location-form-card-body">
                        <Input
                            label="Name"
                            name="name"
                            type="text"
                        />
                        <MultiSelect
                            label="Species"
                            name="species"
                            options={speciesOptions}
                        />
                        <CollapsibleTextarea
                            label="Permits"
                            name="licenseInfo"
                            rows="6"
                        />
                        <CollapsibleTextarea
                            label="Rules"
                            name="rules"
                            rows="6"
                        />
                        <CollapsibleTextarea
                            label="Description"
                            name="description"
                            rows="8"
                        />
                    </div>
                </div>
                <MapInput
                    className="location-form-position"
                    name="geometry"
                    options={mapOptions}
                />
            </div>
            <ButtonBar>
                {buttons}
            </ButtonBar>
        </Form>
    )
}

export default LocationForm
