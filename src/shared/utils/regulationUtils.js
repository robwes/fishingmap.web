import {
    REGION_TYPE_LABELS,
    RULE_SOURCE,
    RULE_SOURCE_REGION_PREFIX,
} from '@/shared/constants/regulations';

/**
 * Formatting and evaluation helpers for resolved species rules
 * (`location.speciesRules[]`) and the regions they come from.
 *
 * Two traps these helpers exist to contain:
 *
 * 1. Protected periods carry no year and may wrap around new year —
 *    `{ startMonth: 12, startDay: 1, endMonth: 1, endDay: 31 }` means
 *    Dec 1 → Jan 31. A naive `start <= date <= end` check reads every
 *    winter closure as "open", so always go through `isDateInProtectedPeriod`.
 * 2. Sizes are decimals on the backend, so 40 must render as "40" and
 *    40.5 as "40.5" — never "40.00".
 */

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Collapses a month/day pair into a comparable ordinal (Mar 5 -> 305) so
 * dates within a year can be compared without inventing a year.
 * @param {number} month - Month, 1-12.
 * @param {number} day - Day of month, 1-31.
 * @returns {number} Comparable ordinal for the month/day pair.
 */
const toOrdinal = (month, day) => (month * 100) + day;

/**
 * Checks that a protected period has all four parts within calendar range.
 * @param {Object} period - Period with startMonth/startDay/endMonth/endDay.
 * @returns {boolean} True when the period can be formatted and compared.
 */
const isValidPeriod = (period) => {
    if (!period) {
        return false;
    }

    const { startMonth, startDay, endMonth, endDay } = period;
    const inMonthRange = (m) => Number.isInteger(m) && m >= 1 && m <= 12;
    const inDayRange = (d) => Number.isInteger(d) && d >= 1 && d <= 31;

    return inMonthRange(startMonth) && inDayRange(startDay)
        && inMonthRange(endMonth) && inDayRange(endDay);
};

/**
 * Maps the `region.type` name from the API to a display label. An unknown
 * value returns null rather than guessing, so a new tier added to the backend
 * enum shows up as a missing label instead of a wrong one.
 * @param {string} type - Region type name ('National' | 'Ely' | 'ManagementArea').
 * @returns {string|null} Label, or null for an unrecognised value.
 */
export const getRegionTypeLabel = (type) => {
    // Own-property check: `type` comes off the wire, and a plain index would
    // happily resolve inherited keys like 'constructor' to something truthy.
    return Object.hasOwn(REGION_TYPE_LABELS, type) ? REGION_TYPE_LABELS[type] : null;
};

/**
 * Whether a resolved rule was inherited from a region or national rule
 * rather than being set on this specific water. Drives the "inherited"
 * affordance on location details and the read-only state in the editor.
 * @param {string} source - The rule's `source` string.
 * @returns {boolean} True when the rule comes from somewhere above this water.
 */
export const isInheritedRule = (source) => {
    return Boolean(source) && source !== RULE_SOURCE.LOCATION;
};

/**
 * Turns a rule's `source` into something worth showing a user — the region
 * name for region-scoped rules, a plain phrase for the other cases.
 * @param {string} source - The rule's `source` string.
 * @returns {string|null} Display label, or null when the source is unusable.
 */
export const getRuleSourceLabel = (source) => {
    if (!source || source === RULE_SOURCE.UNKNOWN) {
        return null;
    }

    if (source === RULE_SOURCE.LOCATION) {
        return 'This water';
    }

    if (source.startsWith(RULE_SOURCE_REGION_PREFIX)) {
        return source.slice(RULE_SOURCE_REGION_PREFIX.length);
    }

    return source;
};

/**
 * Renders a decimal size without trailing zeros, so 40 reads as "40" and
 * 40.5 as "40.5".
 * @param {number} cm - Size in centimetres.
 * @returns {string} The number as a display string.
 */
const formatSize = (cm) => {
    return String(Number(cm));
};

/**
 * Formats the size limit pair into one phrase, covering the min-only,
 * max-only and slot-limit cases.
 * @param {number|null} minimumSizeCm - Minimum legal size, or null.
 * @param {number|null} maximumSizeCm - Maximum legal size, or null.
 * @returns {string|null} Formatted limit, or null when neither is set.
 */
export const formatSizeLimit = (minimumSizeCm, maximumSizeCm) => {
    const hasMin = minimumSizeCm !== null && minimumSizeCm !== undefined;
    const hasMax = maximumSizeCm !== null && maximumSizeCm !== undefined;

    if (hasMin && hasMax) {
        return `${formatSize(minimumSizeCm)}–${formatSize(maximumSizeCm)} cm`;
    }

    if (hasMin) {
        return `Min ${formatSize(minimumSizeCm)} cm`;
    }

    if (hasMax) {
        return `Max ${formatSize(maximumSizeCm)} cm`;
    }

    return null;
};

/**
 * Formats a bag limit. A limit of 0 means no fish may be kept, which reads
 * badly as "0 fish", so it gets its own phrasing.
 * @param {number|null} bagLimit - Number of fish that may be kept, or null.
 * @returns {string|null} Formatted limit, or null when unset.
 */
export const formatBagLimit = (bagLimit) => {
    if (bagLimit === null || bagLimit === undefined) {
        return null;
    }

    if (bagLimit === 0) {
        return 'No fish may be kept';
    }

    return bagLimit === 1 ? '1 fish' : `${bagLimit} fish`;
};

/**
 * Formats one protected period as a day range, e.g. "1 Dec – 31 Jan".
 * Wrapping periods format exactly like non-wrapping ones — the order of the
 * two endpoints is already the answer.
 * @param {Object} period - Period with startMonth/startDay/endMonth/endDay.
 * @returns {string|null} Formatted range, or null when the period is malformed.
 */
export const formatProtectedPeriod = (period) => {
    if (!isValidPeriod(period)) {
        return null;
    }

    const start = `${period.startDay} ${MONTH_NAMES[period.startMonth - 1]}`;
    const end = `${period.endDay} ${MONTH_NAMES[period.endMonth - 1]}`;

    return `${start} – ${end}`;
};

/**
 * Formats every protected period on a rule into one comma-separated string,
 * skipping malformed entries.
 * @param {Array<Object>} periods - The rule's protectedPeriods.
 * @returns {string|null} Formatted ranges, or null when there are none.
 */
export const formatProtectedPeriods = (periods) => {
    if (!Array.isArray(periods) || periods.length === 0) {
        return null;
    }

    const formatted = periods
        .map(formatProtectedPeriod)
        .filter(Boolean);

    return formatted.length > 0 ? formatted.join(', ') : null;
};

/**
 * Whether a date falls inside a protected period, accounting for periods
 * that wrap around new year (Dec 1 → Jan 31). Both endpoints are inclusive.
 * @param {Object} period - Period with startMonth/startDay/endMonth/endDay.
 * @param {Date} date - The date to test.
 * @returns {boolean} True when the date is inside the closed season.
 */
export const isDateInProtectedPeriod = (period, date) => {
    if (!isValidPeriod(period) || !(date instanceof Date) || Number.isNaN(date.getTime())) {
        return false;
    }

    const start = toOrdinal(period.startMonth, period.startDay);
    const end = toOrdinal(period.endMonth, period.endDay);
    const current = toOrdinal(date.getMonth() + 1, date.getDate());

    if (start <= end) {
        return current >= start && current <= end;
    }

    // The period wraps past new year, so it covers both tail ends of the year.
    return current >= start || current <= end;
};

/**
 * Whether any of a rule's protected periods covers the given date.
 * @param {Object} rule - A resolved species rule.
 * @param {Date} [date] - The date to test, defaulting to now.
 * @returns {boolean} True when the species is currently closed at this water.
 */
export const isCurrentlyProtected = (rule, date = new Date()) => {
    if (!rule || !Array.isArray(rule.protectedPeriods)) {
        return false;
    }

    return rule.protectedPeriods.some(period => isDateInProtectedPeriod(period, date));
};

/**
 * Whether a resolved rule actually restricts anything. A rule row with every
 * field empty carries no information, so the UI can skip rendering it.
 * @param {Object} rule - A resolved species rule.
 * @returns {boolean} True when the rule has at least one restriction to show.
 */
export const hasRestrictions = (rule) => {
    if (!rule) {
        return false;
    }

    return formatSizeLimit(rule.minimumSizeCm, rule.maximumSizeCm) !== null
        || formatBagLimit(rule.bagLimit) !== null
        || rule.isCatchAndReleaseOnly === true
        || rule.mustReportCatch === true
        || Boolean(rule.additionalRules)
        || formatProtectedPeriods(rule.protectedPeriods) !== null;
};
