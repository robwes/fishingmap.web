import React from 'react';
import { useField } from 'formik';
import Select from 'react-select';
import Label from './Label';
import Error from './Error';

const customStyles = {
    option: (provided, state) => ({
        ...provided,
        color: state.isFocused || state.isActive ? "white" : provided.color,
        background: state.isFocused || state.isActive ? "#00ADFF" : provided.background,
        padding: ".5em 1em"
    }),
    control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused || state.isActive ? "#00ADFF" : "#9e9e9e",
        // borderWidth: state.isFocused || state.isActive ? "2px" : "1px",
        boxShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
        borderRadius: ".5em"
    }),
    menu: (provided, state) => ({
        ...provided,
        overflow: "hidden"
    }),
    menuList: (provided, state) => ({
        ...provided,
        overflow: "hidden",
        padding: 0
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        padding: ".5em 1em"
    }),
    multiValue: (provided, state) => ({
        ...provided,
        marginLeft: 0,
        background: "#00ADFF",
        color: "white",
        borderRadius: "5px",
        paddingLeft: ".2em",
        paddingRight: ".2em",
        marginRight: ".5em"
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        color: "white"
    }),
    multiValueRemove: (provided, state) => ({
        ...provided,
        color: "white",
    })
}

function MultiSelect({ label, options, ...props }) {
    const [field, meta, helpers] = useField(props);
    const { setTouched, setValue } = helpers;

    return (
        <div className="multi-select">
            <Label htmlFor={props.id || props.name}>{label}</Label>
            <Select
                value={field.value}
                styles={customStyles}
                onChange={setValue}
                onBlur={setTouched}
                options={options}
                isMulti={true}
                theme={theme => ({
                    ...theme,
                    borderRadius: ".5em",
                    colors: {
                        ...theme.colors,
                        primary25: '#00ADFF',
                        primary: '#00ADFF',
                    },
                })}
            />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default MultiSelect
