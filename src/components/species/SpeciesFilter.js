import React from 'react';
import Form from "../common/form/Form";
import SearchBar from '../common/form/SearchBar';

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
