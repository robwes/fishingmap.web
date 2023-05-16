import React from 'react';
import Form from "../form/Form";
import SearchBar from '../form/SearchBar';

function SearchFilter({ onSubmit }) {
    return (
        <Form
            className="search-filter"
            onSubmit={onSubmit}
            initialValues={{
                search: ""
            }}>
            <SearchBar name="search" />
        </Form>
    )
}

export default SearchFilter