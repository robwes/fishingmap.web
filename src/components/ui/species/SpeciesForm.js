import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import DragAndDropImage from '../form/DragAndDropImage';
import Input from '../form/Input';
import TextArea from '../form/TextArea';
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonSuccess from '../buttons/ButtonSuccess';
import ButtonBar from '../buttons/ButtonBar';
import { fileService } from '../../../services/fileService';
import './SpeciesForm.scss';

const formValidation = Yup.object({
    name: Yup.string()
        .max(50, "Max 50 characters")
        .required("Required"),
    description: Yup.string()
        .max(5000, "Max 5000 characters")
        .nullable()
});

function SpeciesForm({ species, onSubmit, onDelete }) {

    const [speciesImages, setSpeciesImages] = useState([]);

    useEffect(() => {
        (async () => {
            if (species && species.images) {
                const images = [];

                for (let image of species.images) {
                    const imageFile = await fileService.getImage(image.path, image.name);
                    if (imageFile) {
                        images.push(imageFile);
                    }
                }

                setSpeciesImages(images);
            }
        })();
    }, [species])

    const getInitialValues = () => {
        if (species) {
            return {
                name: species.name ?? "",
                description: species.description ?? "",
                images: speciesImages
            }
        }

        return { name: "", description: "" };
    }

    const onDeleteClick = async ($event) => {
        $event.preventDefault();
        await onDelete();
    }

    const getFormButtons = (isDisabled) => {
        if (species) {
            return <>
                <ButtonSecondary onClick={onDeleteClick} disabled={isDisabled}>Delete</ButtonSecondary>
                <ButtonSuccess type="submit" disabled={isDisabled}>Save</ButtonSuccess>
            </>;
        }

        return <ButtonSuccess type="submit">Add</ButtonSuccess>;
    }

    return (
        <Formik
            initialValues={getInitialValues()}
            enableReinitialize={true}
            validationSchema={formValidation}
            onSubmit={onSubmit}>
            {({ isSubmitting }) => (
                <Form className='species-form'>
                    <DragAndDropImage
                        text="Add some images"
                        className="species-form-image"
                        name="images"
                        maxNrOfFiles={4}
                        disabled={isSubmitting}
                    />
                    <div className="right">
                        <Input
                            label="Name"
                            name="name"
                            type="text"
                            disabled={isSubmitting}
                        />
                        <TextArea
                            label="Description"
                            name="description"
                            type="textarea"
                            rows="10"
                            disabled={isSubmitting}
                        />
                        <ButtonBar>
                            {getFormButtons(isSubmitting)}
                        </ButtonBar>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default SpeciesForm
