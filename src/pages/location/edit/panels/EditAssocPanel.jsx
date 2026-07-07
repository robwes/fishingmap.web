import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import MultiSelect from '../../../../components/ui/form/MultiSelect';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import { locationService } from '@/shared/services/locationService';

function EditAssocPanel({ location, speciesOptions, permitOptions, onLocationUpdated }) {
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(false);

    /**
     * Patches the location's species and permit associations, then updates
     * the parent with the server's confirmed response.
     * @param {Object} values - Formik field values.
     * @param {Object} formikHelpers
     */
    const handleSave = async (values, { setSubmitting }) => {
        setSaveError(false);
        const result = await locationService.patchLocationAssociations(location.id, {
            species: values.species.map(s => ({ id: s.value, name: s.label })),
            permits: values.permits.map(p => ({ id: p.value, name: p.label })),
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
                species: location.species.map(s => ({ label: s.name, value: s.id })),
                permits: location.permits.map(p => ({ label: p.name, value: p.id })),
            }}
            enableReinitialize
            onSubmit={handleSave}
        >
            {({ isSubmitting }) => (
                <Form>
                    <div className="edit-panel-fields">
                        <MultiSelect
                            label="Species"
                            name="species"
                            options={speciesOptions}
                            placeholder="Select species…"
                            disabled={isSubmitting}
                        />
                        <MultiSelect
                            label="Permits required"
                            name="permits"
                            options={permitOptions}
                            placeholder="Select permits…"
                            disabled={isSubmitting}
                        />
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

export default EditAssocPanel;
