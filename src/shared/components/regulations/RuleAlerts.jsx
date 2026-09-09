import React from 'react';
import RuleFlag from './RuleFlag';
import {
    getActiveProtectedPeriod,
    getActiveWaterQualifiedPeriods,
    formatPeriodEnd,
    formatProtectedPeriod,
} from '@/shared/utils/regulationUtils';

/**
 * The statements on a rule that have to be read before any size or bag limit:
 * the species is off-limits entirely, or it is closed today.
 *
 * Shared rather than repeated on each surface so full protection cannot end up
 * phrased one way on a water and another on the species page.
 *
 * Three states, and they can all be true at once. Full protection is permanent — the fish
 * may not be taken at all. A protected period is a closed season that lifts on a date. A
 * **water-qualified** closure is one the decree scopes to a kind of water ("in rivers and
 * streams"), which we cannot evaluate, because a location is not one water type — a bay is
 * also a river mouth.
 *
 * The third is shown as a caution rather than the solid red certainty, because the two ways
 * of being wrong are not symmetric: an unnecessary warning costs someone a day's fishing, a
 * missing one puts them on a closed river. It never claims the water is closed — it repeats
 * what the rule says and leaves the reader, who can see the water, to decide.
 * @param {Object} [rule] - A resolved species rule.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function RuleAlerts({ rule, today = new Date() }) {
    const activePeriod = getActiveProtectedPeriod(rule, today);
    const qualifiedPeriods = getActiveWaterQualifiedPeriods(rule, today);

    return (
        <>
            {rule?.isFullyProtected && (
                <RuleFlag
                    icon="fa-shield-halved"
                    variant="protected"
                    label="Fully protected"
                    note="may not be taken"
                />
            )}
            {activePeriod && (
                <RuleFlag
                    icon="fa-ban"
                    variant="closed"
                    label="Protected now"
                    note={`until ${formatPeriodEnd(activePeriod)}`}
                />
            )}
            {qualifiedPeriods.map((period, index) => (
                <RuleFlag
                    key={index}
                    icon="fa-circle-exclamation"
                    variant="conditional"
                    // Deliberately not "Protected now": we don't know that this water is one
                    // the closure covers. The dates and the qualifier are the whole message.
                    label="Closed season may apply"
                    note={formatProtectedPeriod(period)}
                />
            ))}
        </>
    )
}

export default RuleAlerts;
