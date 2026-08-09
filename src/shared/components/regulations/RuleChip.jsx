import React from 'react';
import './RuleChip.scss';

/**
 * One fact from a species rule — a size limit, a bag limit, a dormant closed
 * season. Facts read as a row of short statements rather than a table, so a
 * species with one restriction doesn't look like a species with six.
 * @param {string} icon - Font Awesome icon class, e.g. 'fa-ruler-horizontal'.
 * @param {string} [variant] - Optional modifier class, e.g. 'is-release'.
 * @param {React.ReactNode} children - The chip's text.
 */
function RuleChip({ icon, variant, children }) {
    return (
        <span className={variant ? `rule-chip ${variant}` : 'rule-chip'}>
            <i className={`fa-solid ${icon}`}></i>
            {children}
        </span>
    )
}

export default RuleChip;
