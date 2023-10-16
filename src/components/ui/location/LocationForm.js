import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import MapInput from '../form/MapInput';
import ButtonBar from '../buttons/ButtonBar';
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonSuccess from '../buttons/ButtonSuccess';
import LocationFormCard from './LocationFormCard';
import ArticleInput from '../form/ArticleInput';
import { fileService } from '../../../services/fileService';
import geoUtils from '../../../utils/geoUtils';
import './LocationForm.scss';

const formValidation = Yup.object({
    name: Yup.string()
        .max(50, "Max 50 characters")
        .required("Required"),
    description: Yup.string()
        .max(3000, "Max 3000 characters")
        .nullable(),
    rules: Yup.string()
        .max(2000, "Max 2000 characters")
        .nullable(),
    geometry: Yup.object().required("Required")
});

function LocationForm({ location, speciesOptions, permitOptions, mapOptions, onSubmit, onDelete }) {

    const [locationImages, setLocationImages] = useState([]);

    useEffect(() => {
        (async () => {
            if (location && location.images) {

                const images = [];

                for (let image of location.images) {
                    const imageFile = await fileService.getImage(image.path, image.name);
                    if (imageFile) {
                        images.push(imageFile);
                    }
                }

                setLocationImages(images);
            }
        })();
    }, [location])

    const getInitialValues = () => {
        if (location) {
            return {
                ...location,
                species: location.species.map(s => ({ label: s.name, value: s.id })),
                permits: location.permits.map(p => ({ label: p.name, value: p.id })),
                geometry: geoUtils.multiPolygonFeatureToPolygonFeatureCollection(JSON.parse(location.geometry)),
                images: locationImages
            };
        } else {
            return {
                name: "",
                description: "",
                rules: ""
            };
        }
    };

    const onFormSubmitted = async ({ species, permits, geometry, ...rest }, formikBag) => {
        const location = {
            species: species.map(s => ({ id: s.value, name: s.label })),
            permits: permits.map(p => ({ id: p.value, name: p.label })),
            geometry: JSON.stringify(
                geoUtils.polygonFeatureCollectionToMultiPolygonFeature(geometry)
            ),
            ...rest
        };

        await onSubmit(location, formikBag);
    }

    const onDeleteClick = async ($event) => {
        $event.preventDefault();
        await onDelete();
    }

    const getFormButtons = (isDisabled) => {
        if (location) {
            return <>
                <ButtonSecondary onClick={onDeleteClick} disabled={isDisabled}>Delete</ButtonSecondary>
                <ButtonSuccess type="submit" disabled={isDisabled}>Save</ButtonSuccess>
            </>;
        }

        return <ButtonSuccess type="submit" disabled={isDisabled}>Add</ButtonSuccess>;
    }

    return (
        <Formik
            initialValues={getInitialValues()}
            validationSchema={formValidation}
            onSubmit={onFormSubmitted}>
            {({ isSubmitting }) => (
                <Form className="location-form">
                    <div className='left'>
                        <LocationFormCard
                            speciesOptions={speciesOptions}
                            permitOptions={permitOptions}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className='right'>
                        <MapInput
                            className="location-form-position"
                            name="geometry"
                            options={mapOptions}
                            disabled={isSubmitting}
                        />
                        <ArticleInput
                            className='location-form-description'
                            label='Information'
                            name='description'
                            rows={15}
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

export default LocationForm
