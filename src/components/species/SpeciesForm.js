import React from 'react';
import * as Yup from 'yup';
import DragAndDropImage from '../common/form/DragAndDropImage';
import Form from "../common/form/Form";
import Input from '../common/form/Input';
import TextArea from '../common/form/TextArea';
import './species.scss';

function SpeciesForm({ initialValues, onSubmit, onDelete, operation = "add" }) {

    const formValidation = Yup.object({
        name: Yup.string()
            .max(30, "Max 30 characters")
            .required("Required"),
        description: Yup.string()
            .max(1000, "Max 1000 characters")
    });

    let buttons;
    if (operation === "add") {
        buttons = <button className="submit-button species-submit" type="submit">Add</button>;
    } else if (operation === "edit") {
        buttons = <>
            <button onClick={onDelete} className="button button-secondary">Delete</button>
            <button className="button submit-button" type="submit">Save</button>
        </>;
    }

    return (
        <Form
            initialValues={initialValues}
            validationSchema={formValidation}
            onSubmit={onSubmit}
        >
            <div className="add-species-form">
                <DragAndDropImage
                    text="Add some images"
                    cssClass="add-species-image input-group"
                    name="images"
                    initialValue={initialValues.images}
                    maxNrOfFiles={4}
                />
                <div className="add-species-right">
                    <Input
                        label="Name"
                        name="name"
                        type="text"
                    />
                    <TextArea
                        label="Description"
                        name="description"
                        type="textarea"
                        rows="10"
                    />
                    <div className="button-bar button-bar-right">
                        {buttons}
                    </div>
                </div>
            </div>
        </Form>
    )
}

export default SpeciesForm
