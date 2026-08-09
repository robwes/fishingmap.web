import { describe, it, expect } from 'vitest';
import {
    getRegionTypeLabel,
    isInheritedRule,
    getRuleSourceKind,
    getRuleSourceLabel,
    formatSizeLimit,
    formatBagLimit,
    formatProtectedPeriod,
    formatProtectedPeriods,
    isDateInProtectedPeriod,
    getActiveProtectedPeriod,
    formatPeriodEnd,
    isCurrentlyProtected,
    hasRestrictions,
} from './regulationUtils';

const winterClosure = { startMonth: 12, startDay: 1, endMonth: 1, endDay: 31 };
const springClosure = { startMonth: 4, startDay: 1, endMonth: 5, endDay: 31 };

describe('getRegionTypeLabel', () => {
    it('maps the region type names to display labels', () => {
        expect(getRegionTypeLabel('National')).toBe('National');
        expect(getRegionTypeLabel('Ely')).toBe('ELY region');
        expect(getRegionTypeLabel('ManagementArea')).toBe('Management area');
    });

    it('returns null for an unrecognised name rather than guessing', () => {
        // A tier added to the backend enum should surface as a missing label,
        // never as a confidently wrong one.
        expect(getRegionTypeLabel('Municipality')).toBeNull();
        expect(getRegionTypeLabel(null)).toBeNull();
        expect(getRegionTypeLabel(undefined)).toBeNull();
    });

    it('no longer accepts the old integer encoding', () => {
        // region.type is a name over the wire now; an integer here means the
        // JsonStringEnumConverter attribute was dropped server-side.
        expect(getRegionTypeLabel(0)).toBeNull();
        expect(getRegionTypeLabel(1)).toBeNull();
    });

    it('does not resolve inherited object keys', () => {
        expect(getRegionTypeLabel('constructor')).toBeNull();
        expect(getRegionTypeLabel('toString')).toBeNull();
    });
});

describe('isInheritedRule', () => {
    it('treats location-scoped rules as not inherited', () => {
        expect(isInheritedRule('Location')).toBe(false);
    });

    it('treats national and region rules as inherited', () => {
        expect(isInheritedRule('National')).toBe(true);
        expect(isInheritedRule('Region: Uusimaa ELY')).toBe(true);
    });

    it('returns false for a missing source', () => {
        expect(isInheritedRule('')).toBe(false);
        expect(isInheritedRule(undefined)).toBe(false);
    });
});

describe('getRuleSourceKind', () => {
    it('classifies the three real tiers', () => {
        expect(getRuleSourceKind('Location')).toBe('location');
        expect(getRuleSourceKind('Region: Uusimaa ELY')).toBe('region');
        expect(getRuleSourceKind('National')).toBe('national');
    });

    it('returns none for the backend Unknown fallback and for empty sources', () => {
        expect(getRuleSourceKind('Unknown')).toBe('none');
        expect(getRuleSourceKind('')).toBe('none');
        expect(getRuleSourceKind(undefined)).toBe('none');
    });

    it('returns none for an unrecognised source rather than guessing a tier', () => {
        expect(getRuleSourceKind('Municipality: Espoo')).toBe('none');
    });
});

describe('getRuleSourceLabel', () => {
    it('extracts the region name from a region source', () => {
        expect(getRuleSourceLabel('Region: Uusimaa ELY')).toBe('Uusimaa ELY');
    });

    it('labels the other known sources', () => {
        expect(getRuleSourceLabel('Location')).toBe('This water');
        expect(getRuleSourceLabel('National')).toBe('National');
    });

    it('returns null for the backend Unknown fallback and for empty sources', () => {
        expect(getRuleSourceLabel('Unknown')).toBeNull();
        expect(getRuleSourceLabel('')).toBeNull();
        expect(getRuleSourceLabel(undefined)).toBeNull();
    });

    it('does not echo an unrecognised source back at the user', () => {
        expect(getRuleSourceLabel('Municipality: Espoo')).toBeNull();
    });
});

describe('formatSizeLimit', () => {
    it('formats a min-only limit', () => {
        expect(formatSizeLimit(40, null)).toBe('Min 40 cm');
    });

    it('formats a max-only limit', () => {
        expect(formatSizeLimit(null, 70)).toBe('Max 70 cm');
    });

    it('formats a slot limit as a range', () => {
        expect(formatSizeLimit(40, 70)).toBe('40–70 cm');
    });

    it('drops trailing zeros from decimal sizes', () => {
        expect(formatSizeLimit(40.0, null)).toBe('Min 40 cm');
        expect(formatSizeLimit(37.5, null)).toBe('Min 37.5 cm');
    });

    it('returns null when neither bound is set', () => {
        expect(formatSizeLimit(null, null)).toBeNull();
        expect(formatSizeLimit(undefined, undefined)).toBeNull();
    });

    it('keeps a zero bound rather than treating it as unset', () => {
        expect(formatSizeLimit(0, 30)).toBe('0–30 cm');
    });
});

describe('formatBagLimit', () => {
    it('formats the limit against its basis', () => {
        expect(formatBagLimit(6, 'Day')).toBe('6 per day');
        expect(formatBagLimit(1, 'Season')).toBe('1 per season');
        expect(formatBagLimit(4, 'Permit')).toBe('4 per permit');
    });

    it('renders a bare count when the basis is missing', () => {
        // The regulation didn't say what the limit counts against. Naming one
        // anyway would state a legal claim the data does not support.
        expect(formatBagLimit(5)).toBe('5 fish');
        expect(formatBagLimit(5, null)).toBe('5 fish');
        expect(formatBagLimit(1)).toBe('1 fish');
    });

    it('renders a bare count for an unrecognised basis', () => {
        expect(formatBagLimit(5, 'Fortnight')).toBe('5 fish');
        expect(formatBagLimit(5, 'constructor')).toBe('5 fish');
    });

    it('phrases a zero limit as no fish kept, whatever the basis', () => {
        expect(formatBagLimit(0)).toBe('No fish may be kept');
        expect(formatBagLimit(0, 'Day')).toBe('No fish may be kept');
    });

    it('returns null when unset', () => {
        expect(formatBagLimit(null)).toBeNull();
        expect(formatBagLimit(undefined)).toBeNull();
        expect(formatBagLimit(null, 'Day')).toBeNull();
    });
});

describe('formatProtectedPeriod', () => {
    it('formats a period within one year', () => {
        expect(formatProtectedPeriod(springClosure)).toBe('1 Apr – 31 May');
    });

    it('formats a period that wraps past new year in start-to-end order', () => {
        expect(formatProtectedPeriod(winterClosure)).toBe('1 Dec – 31 Jan');
    });

    it('returns null for malformed periods', () => {
        expect(formatProtectedPeriod(null)).toBeNull();
        expect(formatProtectedPeriod({ startMonth: 13, startDay: 1, endMonth: 1, endDay: 1 })).toBeNull();
        expect(formatProtectedPeriod({ startMonth: 1, startDay: 0, endMonth: 1, endDay: 1 })).toBeNull();
        expect(formatProtectedPeriod({ startMonth: 1, startDay: 1 })).toBeNull();
    });
});

describe('formatProtectedPeriods', () => {
    it('joins multiple periods', () => {
        expect(formatProtectedPeriods([springClosure, winterClosure]))
            .toBe('1 Apr – 31 May, 1 Dec – 31 Jan');
    });

    it('skips malformed entries', () => {
        expect(formatProtectedPeriods([springClosure, { startMonth: 99 }])).toBe('1 Apr – 31 May');
    });

    it('returns null when there is nothing to format', () => {
        expect(formatProtectedPeriods([])).toBeNull();
        expect(formatProtectedPeriods(undefined)).toBeNull();
        expect(formatProtectedPeriods([{ startMonth: 99 }])).toBeNull();
    });
});

describe('isDateInProtectedPeriod', () => {
    it('matches dates inside a period within one year', () => {
        expect(isDateInProtectedPeriod(springClosure, new Date(2026, 3, 15))).toBe(true);
    });

    it('excludes dates outside a period within one year', () => {
        expect(isDateInProtectedPeriod(springClosure, new Date(2026, 6, 15))).toBe(false);
    });

    it('includes both endpoints', () => {
        expect(isDateInProtectedPeriod(springClosure, new Date(2026, 3, 1))).toBe(true);
        expect(isDateInProtectedPeriod(springClosure, new Date(2026, 4, 31))).toBe(true);
    });

    it('matches both tails of a period that wraps past new year', () => {
        expect(isDateInProtectedPeriod(winterClosure, new Date(2026, 11, 15))).toBe(true);
        expect(isDateInProtectedPeriod(winterClosure, new Date(2026, 0, 15))).toBe(true);
    });

    it('excludes the open middle of a wrapping period', () => {
        expect(isDateInProtectedPeriod(winterClosure, new Date(2026, 5, 15))).toBe(false);
        expect(isDateInProtectedPeriod(winterClosure, new Date(2026, 1, 1))).toBe(false);
        expect(isDateInProtectedPeriod(winterClosure, new Date(2026, 10, 30))).toBe(false);
    });

    it('handles a single-day period', () => {
        const singleDay = { startMonth: 6, startDay: 10, endMonth: 6, endDay: 10 };

        expect(isDateInProtectedPeriod(singleDay, new Date(2026, 5, 10))).toBe(true);
        expect(isDateInProtectedPeriod(singleDay, new Date(2026, 5, 11))).toBe(false);
    });

    it('returns false for malformed periods and invalid dates', () => {
        expect(isDateInProtectedPeriod(null, new Date(2026, 3, 15))).toBe(false);
        expect(isDateInProtectedPeriod(springClosure, null)).toBe(false);
        expect(isDateInProtectedPeriod(springClosure, new Date('nope'))).toBe(false);
    });
});

describe('getActiveProtectedPeriod', () => {
    it('returns the period covering the date', () => {
        const rule = { protectedPeriods: [springClosure, winterClosure] };

        expect(getActiveProtectedPeriod(rule, new Date(2026, 11, 20))).toEqual(winterClosure);
        expect(getActiveProtectedPeriod(rule, new Date(2026, 3, 20))).toEqual(springClosure);
    });

    it('returns null when nothing covers the date', () => {
        expect(getActiveProtectedPeriod({ protectedPeriods: [springClosure] }, new Date(2026, 7, 20))).toBeNull();
        expect(getActiveProtectedPeriod({ protectedPeriods: [] }, new Date(2026, 7, 20))).toBeNull();
        expect(getActiveProtectedPeriod(null)).toBeNull();
    });
});

describe('formatPeriodEnd', () => {
    it('formats the closing day', () => {
        expect(formatPeriodEnd(springClosure)).toBe('31 May');
        expect(formatPeriodEnd(winterClosure)).toBe('31 Jan');
    });

    it('returns null for a malformed period', () => {
        expect(formatPeriodEnd({ startMonth: 99 })).toBeNull();
        expect(formatPeriodEnd(null)).toBeNull();
    });
});

describe('isCurrentlyProtected', () => {
    it('is true when any period covers the date', () => {
        const rule = { protectedPeriods: [springClosure, winterClosure] };

        expect(isCurrentlyProtected(rule, new Date(2026, 11, 20))).toBe(true);
    });

    it('is false when no period covers the date', () => {
        const rule = { protectedPeriods: [springClosure, winterClosure] };

        expect(isCurrentlyProtected(rule, new Date(2026, 7, 20))).toBe(false);
    });

    it('is false for a rule with no periods', () => {
        expect(isCurrentlyProtected({ protectedPeriods: [] }, new Date(2026, 7, 20))).toBe(false);
        expect(isCurrentlyProtected({}, new Date(2026, 7, 20))).toBe(false);
        expect(isCurrentlyProtected(null)).toBe(false);
    });
});

describe('hasRestrictions', () => {
    const emptyRule = {
        speciesId: 1,
        source: 'National',
        minimumSizeCm: null,
        maximumSizeCm: null,
        bagLimit: null,
        isCatchAndReleaseOnly: false,
        mustReportCatch: false,
        additionalRules: null,
        protectedPeriods: [],
    };

    it('is false for a rule that restricts nothing', () => {
        expect(hasRestrictions(emptyRule)).toBe(false);
        expect(hasRestrictions(null)).toBe(false);
    });

    it('is true when any single restriction is present', () => {
        expect(hasRestrictions({ ...emptyRule, minimumSizeCm: 40 })).toBe(true);
        expect(hasRestrictions({ ...emptyRule, maximumSizeCm: 70 })).toBe(true);
        expect(hasRestrictions({ ...emptyRule, bagLimit: 0 })).toBe(true);
        expect(hasRestrictions({ ...emptyRule, isCatchAndReleaseOnly: true })).toBe(true);
        expect(hasRestrictions({ ...emptyRule, mustReportCatch: true })).toBe(true);
        expect(hasRestrictions({ ...emptyRule, additionalRules: 'No live bait.' })).toBe(true);
        expect(hasRestrictions({ ...emptyRule, protectedPeriods: [winterClosure] })).toBe(true);
    });
});
