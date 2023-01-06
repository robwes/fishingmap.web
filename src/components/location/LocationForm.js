import React from 'react';
import * as Yup from 'yup';
import Form from "../common/form/Form";
import Input from '../common/form/Input';
import MultiSelect from '../common/form/MultiSelect';
import DragAndDropImage from '../common/form/DragAndDropImage';
import MapInput from '../common/form/MapInput';
import CollapsibleTextarea from '../common/form/CollapsibleTextarea';
import './location.css';

function LocationForm({ initialValues, title, speciesOptions, mapOptions, onSubmit, onDelete, operation = "add" }) {

    const formValidation = Yup.object({
        name: Yup.string()
            .max(30, "Max 30 characters")
            .required("Required"),
        description: Yup.string()
            .max(1000, "Max 1000 characters"),
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
        buttons = <button className="submit-button location-submit" type="submit">Add</button>;
    } else if (operation === "edit") {
        buttons = <>
            <button onClick={onDeleteClick} className="button button-secondary">Delete</button>
            <button className="button submit-button" type="submit">Save</button>
        </>;
    }

    return (
        <Form
            initialValues={initialValues}
            validationSchema={formValidation}
            onSubmit={formSubmitted}
        >
            <div className="location-body">
                <h1 className="location-title">{title}</h1>
                <div className="location-card">
                    <DragAndDropImage
                        text="Add some images"
                        name="images"
                        maxNrOfFiles={5}
                        cssClass="add-location-image"
                        initialValue={initialValues.images}
                    />
                    <div className="card-body">
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
                            label="Rules"
                            name="rules"
                            rows="6"
                        />
                        <CollapsibleTextarea
                            label="License info"
                            name="licenseInfo"
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
                    cssClass="add-location-position"
                    name="geometry"
                    options={mapOptions}
                />
            </div>
            <div className="button-bar button-bar-right">
                {buttons}
            </div>
        </Form>
    )
}

export default LocationForm
