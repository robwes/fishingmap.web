import React from 'react';
import './SortControl.scss';

/**
 * A pill-shaped select for choosing a sort order, with a decorative chevron
 * icon and an optional label above (for panel layouts where a bare select
 * would be ambiguous).
 * @param {{ label?: string, value: string, onChange: (value: string) => void, options: Array<{value: string, label: string}> }} props
 */
function SortControl({ label, value, onChange, options }) {
    return (
        <div className="sort-control">
            {label && <label>{label}</label>}
            <div className="sort-control-field">
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
        </div>
    );
}

export default SortControl;
