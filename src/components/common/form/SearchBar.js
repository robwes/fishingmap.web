import React from 'react';
import { useField } from 'formik';
import './form.css';

function SearchBar({cssClass, ...props}) {
    const [field] = useField({ type: "text", ...props });

    const cssClasses = "search" + (cssClass ? ` ${cssClass}` : "");
    return (
        <div className={cssClasses}>
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
