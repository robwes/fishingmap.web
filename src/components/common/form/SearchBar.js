import React from 'react';
import { useField } from 'formik';
import './SearchBar.scss';

function SearchBar({className, ...props}) {
    const [field] = useField({ type: "text", ...props });

    const getCssClasses = () => {
        return "search-bar" + (className ? ` ${className}` : "");
    }

    return (
        <div className={getCssClasses()}>
            <input
                className="search-input"
                placeholder="Search..."
                {...field}
                {...props} />
            <button
                type="submit"
                className="search-submit">
                <i className="fas fa-search"></i>
            </button>
        </div>
    )
}

export default SearchBar
