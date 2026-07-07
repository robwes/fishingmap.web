import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import ButtonSuccess from '../../../../components/ui/buttons/ButtonSuccess';
import { speciesService } from '@/shared/services/speciesService';
import './EditSpeciesBasicPanel.scss';

const validation = Yup.object({
    name: Yup.string().max(50, 'Max 50 characters').required('Required'),
    scientificName: Yup.string().max(100, 'Max 100 characters').nullable(),
    description: Yup.string().max(5000, 'Max 5000 characters').nullable(),
});

/**
 * Edit panel for basic species info (name and description).
 * @param {{ species: object, onSpeciesUpdated: function }} props
 */
function EditSpeciesBasicPanel({ species, onSpeciesUpdated }) {
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        const updated = await speciesService.updateSpecies(species.id, {
            id: species.id,
            name: values.name,
            scientificName: values.scientificName,
            description: values.description,
        });
        if (updated?.id) {
            onSpeciesUpdated(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } else {
            setSaveError(true);
            setTimeout(() => setSaveError(false), 3000);
        }
        setSubmitting(false);
    };

    return (
        <Formik
            initialValues={{ name: species.name ?? '', scientificName: species.scientificName ?? '', description: species.description ?? '' }}
            enableReinitialize
            validationSchema={validation}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className="edit-species-fields">
                    <div className="esp-field">
                        <label className="esp-label" htmlFor="name">
                            Name <span className="esp-required">*</span>
                        </label>
                        <Field id="name" name="name" type="text"
                            className="esp-input" disabled={isSubmitting} />
                        <ErrorMessage name="name" component="p" className="esp-error" />
                    </div>
                    <div className="esp-field">
                        <label className="esp-label" htmlFor="scientificName">Scientific name</label>
                        <Field id="scientificName" name="scientificName" type="text"
                            className="esp-input" disabled={isSubmitting} />
                        <ErrorMessage name="scientificName" component="p" className="esp-error" />
                    </div>
                    <div className="esp-field">
                        <label className="esp-label" htmlFor="description">Description</label>
                        <Field as="textarea" id="description" name="description"
                            className="esp-textarea" rows={7} disabled={isSubmitting} />
                        <ErrorMessage name="description" component="p" className="esp-error" />
                    </div>
                    <div className="edit-species-save-row">
                        {saved && (
                            <span className="edit-species-saved">
                                <i className="fas fa-check-circle" /> Saved
                            </span>
                        )}
                        {saveError && (
                            <span className="edit-species-error">
                                <i className="fas fa-circle-exclamation" /> Failed to save
                            </span>
                        )}
                        <ButtonSuccess type="submit" disabled={isSubmitting}>Save</ButtonSuccess>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

export default EditSpeciesBasicPanel;
