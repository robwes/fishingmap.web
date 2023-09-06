import React from 'react';
import { Formik, Form } from 'formik';
import SearchBar from '../form/SearchBar';

function SearchFilter({ onSubmit }) {
    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{
                search: ""
            }}>
            {({ isSubmitting }) => (
                <Form className="search-filter">
                    <SearchBar name="search" disabled={isSubmitting} />
                </Form>
            )}
        </Formik>
    )
}

export default SearchFilter