import React from 'react';
import { getRuleSourceKind, getRuleSourceLabel } from '@/shared/utils/regulationUtils';
import './RuleSourceBadge.scss';

const SOURCE_ICONS = {
    location: 'fa-location-dot',
    region: 'fa-sitemap',
    national: 'fa-flag',
};

/**
 * Where a resolved rule came from. This is the only inheritance signal the API
 * gives us, and it matters: a rule set on this water can be changed here, while
 * an inherited one applies to every water under that region. Inherited badges
 * stay quiet; the local override is the one that reads as different.
 * @param {string} source - The rule's `source` string.
 */
function RuleSourceBadge({ source }) {
    const kind = getRuleSourceKind(source);
    const label = getRuleSourceLabel(source);

    if (kind === 'none' || !label) {
        return null;
    }

    const title = kind === 'location'
        ? 'Set specifically for this water'
        : `Inherited from ${label}`;

    return (
        <span className={`rule-source is-${kind}`} title={title}>
            <i className={`fa-solid ${SOURCE_ICONS[kind]}`}></i>
            {label}
        </span>
    )
}

export default RuleSourceBadge;
