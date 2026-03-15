import React from 'react';
import { useField, useFormikContext } from 'formik';
import LocationGeometryEditor from './LocationGeometryEditor';

const LocationGeometryInput = ({
    label,
    name = 'geometry',
    navigationPositionName = 'navigationPosition',
    className,
    disabled,
    ...props
}) => {
    const [geometryField] = useField(name);
    const [navPositionField] = useField(navigationPositionName);
    const { setFieldValue, setFieldTouched, errors, touched } = useFormikContext();

    return (
        <div className={className}>
            {label && <label className="form-label">{label}</label>}
            <LocationGeometryEditor
                locationGeometry={geometryField.value}
                locationNavigationPosition={navPositionField.value}
                onGeometryChanged={geoJson => {
                    setFieldValue(name, geoJson);
                    setFieldTouched(name, true, false);
                }}
                onNavigationPositionChanged={geoJson => {
                    setFieldValue(navigationPositionName, geoJson);
                    setFieldTouched(navigationPositionName, true, false);
                }}
                disabled={disabled}
                {...props}
            />
            {touched[name] && errors[name] && (
                <div className="form-error">{errors[name]}</div>
            )}
            {touched[navigationPositionName] && errors[navigationPositionName] && (
                <div className="form-error">{errors[navigationPositionName]}</div>
            )}
        </div>
    );
};

export default LocationGeometryInput;