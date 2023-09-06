import React from 'react';
import SearchBar from '../form/SearchBar';
import { Formik, Form } from 'formik';

function SpeciesFilter({ onSubmit }) {
    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{
                search: ""
            }}>
            {({ isSubmitting }) => (
                <Form>
                    <SearchBar name="search" disabled={isSubmitting} />
                </Form>
            )}
        </Formik>
    );
}

export default SpeciesFilter;
