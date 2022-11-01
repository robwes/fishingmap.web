import React, { useState, useEffect } from 'react'
import Form from "../common/form/Form";
import SearchBar from '../common/form/SearchBar'
import MultiSelect from '../common/form/MultiSelect'
import { speciesService } from '../../services/speciesService';
import FormRange from '../common/form/Range';

function LocationFilter({ onSubmit, onReset, onDistanceChange }) {

    const [species, setSpecies] = useState([]);

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s) {
                setSpecies(s);
            }
        })();
    }, [])

    const formSubmitted = async ({ species, ...rest }, formikBag) => {
        const formValues = {
            species: species.map(s => s.value),
            ...rest
        };

        await onSubmit(formValues, formikBag);
    }

    const speciesOptions = species.sort((s1, s2) => {
        if (s1.name < s2.name) {
            return -1;
        } else if (s2.name > s1.name) {
            return 1;
        }
        return 0;
    }).map(s => ({ label: s.name, value: s.id }));

    return (
        <div className="filter-form">
            <Form
                initialValues={{
                    search: "",
                    distance: "0",
                    species: []
                }}
                onSubmit={formSubmitted}
            >
                <SearchBar
                    cssClass="input-group"
                    name="search"
                />

                <MultiSelect
                    label="Species"
                    name="species"
                    options={speciesOptions}
                />

                <FormRange
                    label="Distance (km)"
                    name="distance"
                    unit="km"
                    onChange={onDistanceChange}
                />

                <div className="button-bar">
                    <button onClick={onReset} className="button button-secondary" type="reset"><i className="fas fa-times"></i>&nbsp;Clear</button>
                    <button className="button button-primary" type="submit"><i className="fas fa-search"></i>&nbsp;Search</button>
                </div>
            </Form>
        </div>
    )
}

export default LocationFilter
