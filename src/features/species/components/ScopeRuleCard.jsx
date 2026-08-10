import React from 'react';
import { Link } from 'react-router-dom';
import RuleAlerts from '@/shared/components/regulations/RuleAlerts';
import RuleFacts from '@/shared/components/regulations/RuleFacts';
import RuleNotes from '@/shared/components/regulations/RuleNotes';
import {
    getActiveProtectedPeriod,
    getAdiposeFinLabel,
    getAdiposeFinHint,
    hasRestrictions,
} from '@/shared/utils/regulationUtils';
import './ScopeRuleCard.scss';

/**
 * One regulation on the species page, labelled by what it applies to.
 *
 * No source badge: on this page the scope *is* the title, so a badge would
 * repeat it. Waters are linked because "which lakes does this affect?" is the
 * natural next question from here.
 * @param {string} title - What the rule covers — a region or water name.
 * @param {string} [meta] - Secondary label, e.g. the region's tier.
 * @param {Object} rule - The regulation.
 * @param {Array<Object>} [locations] - Waters to link, for location-scoped rules.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function ScopeRuleCard({ title, meta, rule, locations, today = new Date() }) {
    const isClosed = rule.isFullyProtected || getActiveProtectedPeriod(rule, today);
    const finLabel = getAdiposeFinLabel(rule.adiposeFin);
    const finHint = getAdiposeFinHint(rule.adiposeFin);

    return (
        <div className={`scope-rule-card${isClosed ? ' is-closed' : ''}`}>
            <div className="scope-rule-head">
                <span className="scope-rule-title">{title}</span>
                {meta && <span className="scope-rule-meta">{meta}</span>}
            </div>

            {/* Separate from `meta`, which names the scope's tier: this narrows
                which fish the rule covers, and the two can both apply. */}
            {finLabel && (
                <span className="scope-rule-fin">
                    <i className="fa-solid fa-fish-fins"></i>
                    {finLabel}
                    {finHint && <span className="scope-rule-fin-hint">{finHint}</span>}
                </span>
            )}

            <RuleAlerts rule={rule} today={today} />

            {hasRestrictions(rule)
                ? <RuleFacts rule={rule} today={today} />
                : <p className="rule-none">No size or bag limits</p>}

            <RuleNotes text={rule.additionalRules} />

            {locations?.length > 0 && (
                <p className="scope-rule-links">
                    {locations.map((location, index) => (
                        <React.Fragment key={location.id}>
                            {index > 0 && ', '}
                            <Link className="scope-rule-link" to={`/locations/${location.id}`}>
                                {location.name}
                            </Link>
                        </React.Fragment>
                    ))}
                </p>
            )}
        </div>
    )
}

export default ScopeRuleCard;
