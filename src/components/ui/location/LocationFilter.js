import React, { useState, useEffect } from 'react';
import Form from "../form/Form";
import SearchBar from '../form/SearchBar';
import MultiSelect from '../form/MultiSelect';
import FormRange from '../form/Range';
import ButtonPrimary from '../buttons/ButtonPrimary';
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonBar from '../buttons/ButtonBar';
import { speciesService } from '../../../services/speciesService';

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

                <ButtonBar>
                    <ButtonSecondary onClick={onReset} type="reset">
                        <i className="fas fa-times"></i>&nbsp;Clear
                    </ButtonSecondary>
                    <ButtonPrimary type="submit">
                        <i className="fas fa-search"></i>&nbsp;Search
                    </ButtonPrimary>
                </ButtonBar>

            </Form>
        </div>
    )
}

export default LocationFilter
