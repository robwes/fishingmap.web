import React from 'react';
import './RuleFlag.scss';

/**
 * A rule statement that has to be read before the others — currently the
 * "protected now" banner. Deliberately louder than a RuleChip: an angler
 * scanning the list needs to see a closed season before a size limit.
 * @param {string} icon - Font Awesome icon class.
 * @param {string} variant - Modifier suffix, e.g. 'closed' for `is-closed`.
 * @param {string} label - The main statement.
 * @param {string} [note] - Secondary detail, e.g. when the closure lifts.
 */
function RuleFlag({ icon, variant, label, note }) {
    return (
        <div className={`rule-flag is-${variant}`}>
            <i className={`fa-solid ${icon}`}></i>
            <span className="rule-flag-label">{label}</span>
            {note && <span className="rule-flag-note">{note}</span>}
        </div>
    )
}

export default RuleFlag;
