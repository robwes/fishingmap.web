import React from 'react';
import { RULE_STATE } from '@/shared/constants/regulations';
import './RuleStateChoice.scss';

// Named here rather than inline so the three states read as one set, in the order an
// administrator moves through them: nothing decided, then inherit, then diverge.
const OPTIONS = [
    { state: RULE_STATE.UNDECIDED, label: 'Not set', icon: 'fa-circle-question' },
    { state: RULE_STATE.FOLLOWS, label: 'Follow region', icon: 'fa-sitemap' },
    { state: RULE_STATE.CUSTOM, label: 'Custom rule', icon: 'fa-location-dot' },
];

/**
 * What a water does about one species: nothing yet, inherit its region's rules, or carry
 * its own.
 *
 * The three are shown together rather than as a single "override" button, because the
 * middle state is a decision an administrator has to make on purpose. A water does not
 * inherit by default, so leaving this alone is itself a visible, unresolved answer.
 * @param {string} value - The current state, one of RULE_STATE.
 * @param {Function} onChange - Called with the chosen state.
 * @param {boolean} [disabled] - Disables every option while a write is in flight.
 * @param {string} [customHint] - Why custom is unavailable, when it is.
 */
function RuleStateChoice({ value, onChange, disabled = false, customHint }) {
    return (
        <div className="rule-state-choice" role="group" aria-label="Rule for this species">
            {OPTIONS.map(option => {
                const isCurrent = option.state === value;
                const isBlocked = option.state === RULE_STATE.CUSTOM && Boolean(customHint);

                return (
                    <button
                        key={option.state}
                        type="button"
                        className={`rule-state-option${isCurrent ? ' is-current' : ''}`}
                        aria-pressed={isCurrent}
                        title={isBlocked ? customHint : undefined}
                        disabled={disabled || isBlocked || isCurrent}
                        onClick={() => onChange(option.state)}>
                        <i className={`fa-solid ${option.icon}`}></i>
                        {option.label}
                    </button>
                );
            })}
        </div>
    )
}

export default RuleStateChoice;
