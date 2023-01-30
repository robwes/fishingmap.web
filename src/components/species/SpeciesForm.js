import React from 'react';
import * as Yup from 'yup';
import ButtonSecondary from '../common/ButtonSecondary';
import ButtonSuccess from '../common/ButtonSuccess';
import DragAndDropImage from '../common/form/DragAndDropImage';
import Form from "../common/form/Form";
import Input from '../common/form/Input';
import TextArea from '../common/form/TextArea';
import ButtonBar from '../common/ButtonBar';
import './SpeciesForm.scss';

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
