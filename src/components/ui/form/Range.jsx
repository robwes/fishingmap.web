import React, { useEffect } from 'react';
import { useField } from 'formik';
import Label from './Label';
import './Range.scss';

function Range({ 
    label, 
    name, 
    value = 0, 
    min = 0, 
    max = 100, 
    zeroIsInfinity = true, 
    disabled = false,
    onChange, 
    ...props }) {

    // eslint-disable-next-line
    const [field, meta, helpers] = useField({ name, type: "range"})
    const { setValue } = helpers;

    useEffect(() => {
        let initialValue = value;

        if (initialValue < min) {
            initialValue = min;
        } else if (initialValue > max) {
            initialValue = max;
        }

        setValue(initialValue);

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (typeof field.value !== "number") {
            setValue(min);
        }

        if (onChange) {
            onChange(field.value);
        }

        // eslint-disable-next-line
    }, [field.value])

    return (
        <div className="range">
            <Label htmlFor={props.id || props.name}>{label}</Label>
            <input 
                className='range-input'
                type="range"
                min={min}
                max={max}
                disabled={disabled}
                {...field}
                />
            <div className="range-value">
                {zeroIsInfinity && field.value === 0 ? (
                    <span><i className="fas fa-infinity"></i></span>
                ) : (
                    <span>{field.value} {props.unit}</span>
                )}
            </div>
        </div>
    )
}

export default Range
