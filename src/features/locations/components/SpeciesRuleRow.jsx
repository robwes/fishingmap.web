import React from 'react';
import { Link } from 'react-router-dom';
import RuleSourceBadge from './RuleSourceBadge';
import RuleFlag from '@/shared/components/regulations/RuleFlag';
import RuleFacts from '@/shared/components/regulations/RuleFacts';
import RuleNotes from '@/shared/components/regulations/RuleNotes';
import {
    getRuleSourceKind,
    getActiveProtectedPeriod,
    formatPeriodEnd,
    hasRestrictions,
} from '@/shared/utils/regulationUtils';
import './SpeciesRuleRow.scss';

/**
 * One species at a water, with the rule that actually applies to it. The rule
 * sits next to the fish rather than in a separate section further down the
 * page, because that is the question being asked — "can I keep this one?"
 * @param {Object} species - The species, with at least id and name.
 * @param {Object} [rule] - The resolved rule for this species, if any.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function SpeciesRuleRow({ species, rule, today = new Date() }) {
    const activePeriod = getActiveProtectedPeriod(rule, today);
    const isRegulated = hasRestrictions(rule);

    const classNames = ['species-rule-row'];
    if (getRuleSourceKind(rule?.source) === 'location') {
        classNames.push('is-override');
    }
    if (activePeriod) {
        classNames.push('is-closed');
    }
    if (!isRegulated) {
        classNames.push('is-unregulated');
    }

    return (
        <li className={classNames.join(' ')}>
            <div className="species-rule-head">
                <Link className="species-rule-name" to={`/species/${species.id}`}>
                    <i className="fa-solid fa-fish"></i>
                    {species.name}
                </Link>
                {isRegulated && <RuleSourceBadge source={rule.source} />}
            </div>

            {!isRegulated && <p className="rule-none">No size or bag limits</p>}

            {activePeriod && (
                <RuleFlag
                    icon="fa-ban"
                    variant="closed"
                    label="Protected now"
                    note={`until ${formatPeriodEnd(activePeriod)}`}
                />
            )}

            {isRegulated && <RuleFacts rule={rule} today={today} />}
            {isRegulated && <RuleNotes text={rule.additionalRules} />}
        </li>
    )
}

export default SpeciesRuleRow;
