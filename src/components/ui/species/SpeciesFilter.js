import React from 'react';
import Form from "../form/Form";
import SearchBar from '../form/SearchBar';

function SpeciesFilter({ onSubmit }) {
    return (
        <Form
            onSubmit={onSubmit}
            initialValues={{
                search: ""
            }}>
            <SearchBar name="search" />
        </Form>
    );
}

export default SpeciesFilter;
