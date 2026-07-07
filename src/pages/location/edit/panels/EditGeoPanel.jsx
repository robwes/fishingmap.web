import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import LocationGeometryInput from '../../../../components/ui/location/LocationGeometryInput';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import { locationService } from '@/shared/services/locationService';
import geoUtils from '@/shared/utils/geoUtils';
import './EditGeoPanel.scss';

function EditGeoPanel({ location, isAdmin, onLocationUpdated }) {
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const locked = !isAdmin;

    const initialGeometry = location.geometry
        ? geoUtils.multiPolygonFeatureToPolygonFeatureCollection(JSON.parse(location.geometry))
        : null;

    /**
     * Patches the location's geometry and navigation position, then updates
     * the parent with the server's confirmed response.
     * @param {Object} values - Formik field values.
     * @param {Object} formikHelpers
     */
    const handleSave = async (values, { setSubmitting }) => {
        if (locked) {
            return;
        }
        setSaveError(false);
        const geometryStr = values.geometry
            ? JSON.stringify(geoUtils.polygonFeatureCollectionToMultiPolygonFeature(values.geometry))
            : location.geometry;
        const result = await locationService.patchLocationGeometry(location.id, {
            geometry: geometryStr,
            navigationPosition: values.navigationPosition,
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
                geometry: initialGeometry,
                navigationPosition: location.navigationPosition ?? null,
            }}
            enableReinitialize
            onSubmit={handleSave}
        >
            {({ isSubmitting }) => (
                <Form>
                    <div className="edit-panel-fields">
                        {locked && (
                            <div className="geo-lock-notice">
                                <i className="fas fa-lock" />
                                Editing geometry requires the <strong>Admin</strong> role.
                            </div>
                        )}
                        <div className="ws-map-area geo-map-area">
                            <LocationGeometryInput
                                name="geometry"
                                navigationPositionName="navigationPosition"
                                location={location}
                                disabled={locked || isSubmitting}
                            />
                        </div>
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
                            <ButtonSuccess
                                type="submit"
                                disabled={isSubmitting || locked}
                                style={locked ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                            >
                                {locked ? <><i className="fas fa-lock" /> Save</> : 'Save'}
                            </ButtonSuccess>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

export default EditGeoPanel;
