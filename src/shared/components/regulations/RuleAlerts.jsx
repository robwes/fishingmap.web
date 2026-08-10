import React from 'react';
import RuleFlag from './RuleFlag';
import { getActiveProtectedPeriod, formatPeriodEnd } from '@/shared/utils/regulationUtils';

/**
 * The statements on a rule that have to be read before any size or bag limit:
 * the species is off-limits entirely, or it is closed today.
 *
 * Shared rather than repeated on each surface so full protection cannot end up
 * phrased one way on a water and another on the species page.
 *
 * The two are distinct and can both be true. Full protection is permanent — the
 * fish may not be taken at all — while a protected period is a closed season
 * that lifts on a date.
 * @param {Object} [rule] - A resolved species rule.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function RuleAlerts({ rule, today = new Date() }) {
    const activePeriod = getActiveProtectedPeriod(rule, today);

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
        </>
    )
}

export default RuleAlerts;
