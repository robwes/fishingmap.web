import React from 'react';
import './SearchInput.scss';

/**
 * Generic pill-shaped controlled search input with a leading magnifier icon
 * and a clear button that appears once there is text. Layout sizing (width,
 * flex) is left to the consumer.
 * @param {{ value: string, onChange: (value: string) => void, placeholder?: string, ariaLabel?: string }} props
 */
function SearchInput({ value, onChange, placeholder = 'Search…', ariaLabel = 'Search' }) {
    return (
        <div className="search-input">
            <i className="fas fa-magnifying-glass lead-icon" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={ariaLabel}
            />
            {value && (
                <button type="button" className="clear" aria-label="Clear search" onClick={() => onChange('')}>
                    <i className="fas fa-xmark" />
                </button>
            )}
        </div>
    );
}

export default SearchInput;
