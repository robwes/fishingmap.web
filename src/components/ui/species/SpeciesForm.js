import React from 'react';
import * as Yup from 'yup';
import Form from "../form/Form";
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonSuccess from '../buttons/ButtonSuccess';
import DragAndDropImage from '../form/DragAndDropImage';
import Input from '../form/Input';
import TextArea from '../form/TextArea';
import ButtonBar from '../buttons/ButtonBar';
import './SpeciesForm.scss';

function SpeciesForm({ initialValues, onSubmit, onDelete, operation = "add" }) {

    const formValidation = Yup.object({
        name: Yup.string()
            .max(30, "Max 30 characters")
            .required("Required"),
        description: Yup.string()
            .max(1000, "Max 1000 characters")
            .nullable()
    });

    let buttons;
    if (operation === "add") {
        buttons = <ButtonSuccess type="submit">Add</ButtonSuccess>;
    } else if (operation === "edit") {
        buttons = <>
            <ButtonSecondary onClick={onDelete}>Delete</ButtonSecondary>
            <ButtonSuccess type="submit">Save</ButtonSuccess>
        </>;
    }

    return (
        <Form
            initialValues={initialValues}
            validationSchema={formValidation}
            onSubmit={onSubmit}
        >
            <div className="species-form">
                <DragAndDropImage
                    text="Add some images"
                    className="species-form-image"
                    name="images"
                    initialValue={initialValues.images}
                    maxNrOfFiles={4}
                />
                <div className="right">
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
                    <ButtonBar>
                        {buttons}
                    </ButtonBar>
                </div>
            </div>
        </Form>
    )
}

export default SpeciesForm
