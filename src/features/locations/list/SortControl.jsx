import React from 'react';
import './SortControl.scss';

/**
 * A pill-shaped select for choosing a sort order, with a decorative chevron icon.
 * @param {{ value: string, onChange: (value: string) => void, options: Array<{value: string, label: string}> }} props
 */
function SortControl({ value, onChange, options }) {
    return (
        <div className="sort-control">
            <select
                className="sort-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <i className="fas fa-chevron-down chev" />
        </div>
    );
}

export default SortControl;
