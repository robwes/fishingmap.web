import React from 'react';
import { useFormikContext } from 'formik';
import LocationGeometryInput from '@/features/locations/components/LocationGeometryInput';
import './StepMap.scss';

function StepMap() {
    const { values, errors, touched } = useFormikContext();
    const hasGeometry = !!(values.geometry?.features?.length > 0);
    const hasNavPos = !!values.navigationPosition;

    return (
        <div className="wizard-step-panel ws-map-panel">
            <div>
                <h2 className="ws-panel-title">Draw on map</h2>
                <p className="ws-panel-desc">Draw the fishing area boundary and place a navigation point for easy access.</p>
            </div>
            <div className="ws-map-area">
                <LocationGeometryInput
                    name="geometry"
                    navigationPositionName="navigationPosition"
                />
            </div>
            {touched.geometry && errors.geometry && (
                <div className="ws-field-error">
                    <i className="fas fa-circle-exclamation" /> A fishing area boundary is required before continuing.
                </div>
            )}
            {(hasGeometry || hasNavPos) && (
                <div className="ws-map-status">
                    <i className="fa-solid fa-circle-check" style={{ color: '#00A361' }} />
                    {hasGeometry && hasNavPos
                        ? 'Area drawn · Navigation point set'
                        : hasGeometry
                        ? 'Area drawn'
                        : 'Navigation point set'}
                </div>
            )}
        </div>
    );
}

export default StepMap;
