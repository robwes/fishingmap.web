import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/shared/components/form/Input';
import TextArea from '@/features/locations/components/TextArea';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import { locationService } from '@/shared/services/locationService';

const validationSchema = Yup.object({
    name: Yup.string().max(50, 'Max 50 characters').required('Required'),
    description: Yup.string().max(3000, 'Max 3000 characters').nullable(),
    rules: Yup.string().max(2000, 'Max 2000 characters').nullable(),
});

function EditBasicInfoPanel({ location, onLocationUpdated }) {
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(false);

    /**
     * Patches the location's basic info, then updates the parent with the
     * server's response so the form reinitializes with confirmed values.
     * Only shows the saved confirmation after the server responds successfully.
     * @param {Object} values - Formik field values.
     * @param {Object} formikHelpers
     */
    const handleSave = async (values, { setSubmitting }) => {
        setSaveError(false);
        const result = await locationService.patchLocationInfo(location.id, {
            name: values.name,
            description: values.description,
            rules: values.rules,
        });

        if (result?.id) {
            onLocationUpdated(result);
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
            initialValues={{
                name: location.name ?? '',
                description: location.description ?? '',
                rules: location.rules ?? '',
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSave}
        >
            {({ isSubmitting }) => (
                <Form>
                    <div className="edit-panel-fields">
                        <Input label="Name" name="name" type="text" disabled={isSubmitting} />
                        <TextArea label="Description" name="description" rows={5} disabled={isSubmitting} />
                        <TextArea label="Rules" name="rules" rows={7} disabled={isSubmitting} />
                        <div className="edit-save-row">
                            {saved && (
                                <span className="edit-saved-confirmation">
                                    <i className="fas fa-check-circle" /> Saved
                                </span>
                            )}
                            {saveError && (
                                <span className="edit-save-error">
                                    <i className="fas fa-circle-exclamation" /> Failed to save
                                </span>
                            )}
                            <ButtonSuccess type="submit" disabled={isSubmitting}>
                                Save
                            </ButtonSuccess>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

export default EditBasicInfoPanel;
