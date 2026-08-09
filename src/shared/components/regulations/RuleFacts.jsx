import React from 'react';
import RuleChip from './RuleChip';
import {
    formatSizeLimit,
    formatBagLimit,
    formatProtectedPeriod,
    isDateInProtectedPeriod,
} from '@/shared/utils/regulationUtils';
import './RuleFacts.scss';

/**
 * The restrictions on a resolved rule, as a row of chips. Periods that are
 * currently in force are left out — those are shown by the louder RuleFlag
 * above, and repeating them here would read as two separate closures.
 * @param {Object} rule - A resolved species rule.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function RuleFacts({ rule, today = new Date() }) {
    const size = formatSizeLimit(rule.minimumSizeCm, rule.maximumSizeCm);
    const bagLimit = formatBagLimit(rule.bagLimit, rule.bagLimitBasis);
    const dormantPeriods = (rule.protectedPeriods || [])
        .filter(period => !isDateInProtectedPeriod(period, today));

    const hasAnything = size
        || bagLimit
        || rule.isCatchAndReleaseOnly
        || rule.mustReportCatch
        || dormantPeriods.length > 0;

    if (!hasAnything) {
        return null;
    }

    return (
        <div className="rule-facts">
            {rule.isCatchAndReleaseOnly && (
                <RuleChip icon="fa-arrow-rotate-left" variant="is-release">
                    Catch and release only
                </RuleChip>
            )}
            {size && <RuleChip icon="fa-ruler-horizontal">{size}</RuleChip>}
            {bagLimit && <RuleChip icon="fa-basket-shopping">{bagLimit}</RuleChip>}
            {rule.mustReportCatch && <RuleChip icon="fa-clipboard-check">Report catch</RuleChip>}
            {dormantPeriods.map((period, index) => (
                <RuleChip key={index} icon="fa-calendar-xmark">
                    Protected {formatProtectedPeriod(period)}
                </RuleChip>
            ))}
        </div>
    )
}

export default RuleFacts;
