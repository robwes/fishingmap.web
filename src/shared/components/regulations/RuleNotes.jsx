import React, { useState } from 'react';
import './RuleNotes.scss';

/**
 * The free-text `additionalRules` on a resolved rule. Long ones stay folded:
 * a single dense regulation runs to several hundred words, which would push
 * every species below it off the screen.
 * @param {string} text - The rule's additionalRules.
 * @param {number} [collapsedAt] - Length above which the text is clamped.
 */
function RuleNotes({ text, collapsedAt = 110 }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!text) {
        return null;
    }

    if (text.length <= collapsedAt) {
        return <p className="rule-notes">{text}</p>;
    }

    return (
        <div className="rule-notes-wrap">
            <p className={isOpen ? 'rule-notes' : 'rule-notes is-clamped'}>{text}</p>
            <button
                type="button"
                className="rule-notes-toggle"
                onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Show less' : 'Read full rule'}
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </button>
        </div>
    )
}

export default RuleNotes;
