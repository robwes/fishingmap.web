import React from 'react';
import { Link } from 'react-router-dom';
import RuleSourceBadge from './RuleSourceBadge';
import RuleAlerts from '@/shared/components/regulations/RuleAlerts';
import RuleFacts from '@/shared/components/regulations/RuleFacts';
import RuleNotes from '@/shared/components/regulations/RuleNotes';
import {
    getRuleSourceKind,
    getActiveProtectedPeriod,
    getAdiposeFinLabel,
    getAdiposeFinHint,
    getRuleKey,
    hasRestrictions,
} from '@/shared/utils/regulationUtils';
import { RULE_STATE } from '@/shared/constants/regulations';
import './SpeciesRuleRow.scss';

/**
 * What to say when a species has no rule to show. The two cases must not read alike:
 * a water that inherits from a region setting nothing is a checked, empty answer, while
 * a water nobody has recorded a decision for is not an answer at all — and phrasing the
 * second as "no limits" would tell anglers a protected fish is fair game.
 * @param {string} state - One of RULE_STATE.
 * @param {string} [regionName] - The water's own region, when it has one.
 */
function NoRuleNote({ state, regionName }) {
    if (state === RULE_STATE.FOLLOWS) {
        return (
            <p className="rule-none">
                {regionName
                    ? <>Follows {regionName} — no rule set there or above.</>
                    : <>Follows the national rules — none set for this species.</>}
            </p>
        )
    }

    return (
        <p className="rule-unrecorded">
            <i className="fa-solid fa-circle-question"></i>
            <span>
                No rule recorded for this water. National and regional rules still
                apply — check before you fish.
            </span>
        </p>
    )
}

/**
 * State modifiers for one rule block.
 * @param {Object} [rule] - A resolved species rule.
 * @param {Date} today - Reference date.
 * @returns {Array<string>} Modifier class names.
 */
const stateClasses = (rule, today) => {
    const classes = [];

    if (getRuleSourceKind(rule?.source) === 'location') {
        classes.push('is-override');
    }
    // Full protection and a closed season both mean the fish stays in the
    // water today; the flag inside says which.
    if (rule?.isFullyProtected || getActiveProtectedPeriod(rule, today)) {
        classes.push('is-closed');
    }
    if (!hasRestrictions(rule)) {
        classes.push('is-unregulated');
    }

    return classes;
};

/**
 * What one rule says, without naming the species — the shared body of both the
 * single-rule and per-variant layouts.
 * @param {Object} [rule] - The resolved rule, or undefined when unregulated.
 * @param {Date} today - Reference date.
 */
function RuleBody({ rule, today }) {
    const isRegulated = hasRestrictions(rule);

    return (
        <>
            {!isRegulated && <p className="rule-none">No size or bag limits</p>}
            <RuleAlerts rule={rule} today={today} />
            {isRegulated && <RuleFacts rule={rule} today={today} />}
            {isRegulated && <RuleNotes text={rule.additionalRules} />}
        </>
    )
}

/**
 * One species at a water, with the rule or rules that actually apply to it. The
 * rules sit next to the fish rather than in a separate section further down the
 * page, because that is the question being asked — "can I keep this one?"
 *
 * A species can carry more than one rule when the regulations distinguish fish
 * by adipose fin: a wild trout and a hatchery trout in the same lake follow
 * different rules. Those render as labelled blocks under one species heading,
 * which is how the regulations themselves read. Where no such distinction is
 * made — every species until one is entered — there is a single unlabelled
 * block and the row looks exactly as it always did.
 * @param {Object} species - The species, with at least id and name.
 * @param {Array<Object>} [rules] - The resolved rules for this species, if any.
 * @param {string} [state] - One of RULE_STATE; decides what an absence of rules means.
 * @param {string} [regionName] - The water's own region, for the inherits-nothing note.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function SpeciesRuleRow({
    species,
    rules = [],
    state = RULE_STATE.UNDECIDED,
    regionName,
    today = new Date(),
}) {
    const hasVariants = rules.length > 1;
    const single = hasVariants ? null : rules[0];
    // No rule is not the same as a rule with nothing in it. An empty rule is an answer
    // somebody recorded; no rule means the question hasn't been answered here.
    const hasAnyRule = rules.length > 0;

    const classNames = ['species-rule-row'];
    if (hasVariants) {
        classNames.push('has-variants');
    } else if (hasAnyRule) {
        classNames.push(...stateClasses(single, today));
    } else if (state === RULE_STATE.UNDECIDED) {
        classNames.push('is-unrecorded');
    } else {
        classNames.push('is-unregulated');
    }

    return (
        <li className={classNames.join(' ')}>
            <div className="species-rule-head">
                <Link className="species-rule-name" to={`/species/${species.id}`}>
                    <i className="fa-solid fa-fish"></i>
                    {species.name}
                </Link>
                {!hasVariants && hasRestrictions(single) && <RuleSourceBadge source={single.source} />}
            </div>

            {!hasAnyRule && <NoRuleNote state={state} regionName={regionName} />}

            {hasAnyRule && !hasVariants && <RuleBody rule={single} today={today} />}

            {hasVariants && rules.map(rule => {
                const label = getAdiposeFinLabel(rule.adiposeFin);
                const hint = getAdiposeFinHint(rule.adiposeFin);

                return (
                    <div
                        key={getRuleKey(species.id, rule.adiposeFin)}
                        className={['species-rule-variant', ...stateClasses(rule, today)].join(' ')}>
                        <div className="species-rule-variant-head">
                            <span className="species-rule-variant-label">
                                {/* Null fin means "any other fish of this species" here: a
                                    sibling rule has already claimed the fin state it names. */}
                                {label ?? 'All other fish'}
                                {hint && <span className="species-rule-variant-hint">{hint}</span>}
                            </span>
                            {hasRestrictions(rule) && <RuleSourceBadge source={rule.source} />}
                        </div>
                        <RuleBody rule={rule} today={today} />
                    </div>
                );
            })}
        </li>
    )
}

export default SpeciesRuleRow;
