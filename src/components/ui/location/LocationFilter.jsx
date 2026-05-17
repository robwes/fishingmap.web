import React, { useState, useEffect } from 'react';
import SearchBar from '../form/SearchBar';
import MultiSelect from '../form/MultiSelect';
import FormRange from '../form/Range';
import ButtonPrimary from '../buttons/ButtonPrimary';
import { speciesService } from '../../../services/speciesService';
import { Formik, Form } from 'formik';
import './LocationFilter.scss';

function LocationFilter({ onSubmit, onReset, onDistanceChange, resultCount }) {

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
            <Formik
                initialValues={{
                    search: "",
                    distance: "0",
                    species: []
                }}
                onSubmit={formSubmitted}>
                {({ isSubmitting }) => (
                    <Form>
                        <SearchBar
                            name="search"
                            disabled={isSubmitting}
                        />

                        <MultiSelect
                            label="Species"
                            name="species"
                            options={speciesOptions}
                            disabled={isSubmitting}
                        />

                        <FormRange
                            label="Distance (km)"
                            name="distance"
                            unit="km"
                            onChange={onDistanceChange}
                            disabled={isSubmitting}
                        />

                        <div className="filter-actions">
                            <button
                                type="reset"
                                className="reset-link"
                                onClick={onReset}
                                disabled={isSubmitting}>
                                <i className="fas fa-rotate-left"></i>&nbsp;Reset
                            </button>
                            <div className="filter-actions-end">
                                {resultCount !== undefined && (
                                    <span className="filter-result-count">
                                        {resultCount.toLocaleString()} {resultCount === 1 ? 'location' : 'locations'}
                                    </span>
                                )}
                                <ButtonPrimary type="submit" disabled={isSubmitting}>
                                    <i className="fas fa-search"></i>&nbsp;Search
                                </ButtonPrimary>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default LocationFilter
