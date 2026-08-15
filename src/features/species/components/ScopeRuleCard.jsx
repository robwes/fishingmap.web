import React from 'react';
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
 * One region's regulation on the species page, labelled by the region it covers.
 *
 * No source badge: on this page the scope *is* the title, so a badge would repeat it.
 * @param {string} title - What the rule covers — the region's name.
 * @param {string} [meta] - Secondary label, e.g. the region's tier.
 * @param {Object} rule - The regulation.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function ScopeRuleCard({ title, meta, rule, today = new Date() }) {
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
        </div>
    )
}

export default ScopeRuleCard;
