import { describe, it, expect } from 'vitest';
import {
    getRegionTypeLabel,
    buildRegionChain,
    isValidProtectedPeriod,
    getDaysInMonth,
    resolveRegionRule,
    getRegionChangeImpact,
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
    getAdiposeFinLabel,
    getAdiposeFinHint,
    getRuleKey,
    getSpeciesRuleState,
} from './regulationUtils';

const winterClosure = { startMonth: 12, startDay: 1, endMonth: 1, endDay: 31 };
const springClosure = { startMonth: 4, startDay: 1, endMonth: 5, endDay: 31 };

describe('getRegionTypeLabel', () => {
    it('maps the region type names to display labels', () => {
        expect(getRegionTypeLabel('Root')).toBe('National');
        expect(getRegionTypeLabel('Ely')).toBe('ELY region');
        expect(getRegionTypeLabel('ManagementArea')).toBe('Management area');
    });

    it('returns null for an unrecognised name rather than guessing', () => {
        // A tier added to the backend enum should surface as a missing label,
        // never as a confidently wrong one.
        expect(getRegionTypeLabel('Municipality')).toBeNull();
        // The root tier is 'Root'; 'National' is the rule *source* label, not a
        // region type. Half-reverting the rename would fail here.
        expect(getRegionTypeLabel('National')).toBeNull();
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

describe('buildRegionChain', () => {
    const regions = [
        { id: 1, name: 'Finland', parentRegionId: null },
        { id: 2, name: 'Uusimaa ELY', parentRegionId: 1 },
        { id: 5, name: 'Espoo lakes', parentRegionId: 2 },
    ];

    it('builds the chain root-first', () => {
        expect(buildRegionChain(regions, 5).map(r => r.name))
            .toEqual(['Finland', 'Uusimaa ELY', 'Espoo lakes']);
    });

    it('returns a single step for a root region', () => {
        expect(buildRegionChain(regions, 1).map(r => r.name)).toEqual(['Finland']);
    });

    it('returns nothing for an unknown or absent region', () => {
        expect(buildRegionChain(regions, 99)).toEqual([]);
        expect(buildRegionChain(regions, null)).toEqual([]);
        expect(buildRegionChain(undefined, 1)).toEqual([]);
    });

    it('stops where the chain breaks rather than dropping the whole chain', () => {
        const orphaned = [{ id: 5, name: 'Espoo lakes', parentRegionId: 404 }];

        expect(buildRegionChain(orphaned, 5).map(r => r.name)).toEqual(['Espoo lakes']);
    });

    it('terminates on a cycle instead of hanging', () => {
        // parentRegionId is editable, so a loop is reachable through the UI.
        const cyclic = [
            { id: 1, name: 'A', parentRegionId: 2 },
            { id: 2, name: 'B', parentRegionId: 1 },
        ];

        expect(buildRegionChain(cyclic, 1).map(r => r.name)).toEqual(['B', 'A']);
    });
});

describe('getRegionChangeImpact', () => {
    const finland = { id: 1, name: 'Finland', parentRegionId: null };
    const uusimaa = { id: 2, name: 'Uusimaa ELY', parentRegionId: 1 };
    const lapland = { id: 3, name: 'Lapland ELY', parentRegionId: 1 };

    const species = [{ id: 10, name: 'Pike' }, { id: 20, name: 'Perch' }];
    const regulations = [
        { id: 900, speciesId: 10, regionId: 1 },   // Pike, nationally
        { id: 901, speciesId: 10, regionId: 2 },   // Pike, stricter in Uusimaa
        { id: 902, speciesId: 20, regionId: 1 },   // Perch, nationally
    ];

    const impact = (fromChain, toChain, overriddenSpeciesIds = []) => getRegionChangeImpact({
        species, regulations, fromChain, toChain, overriddenSpeciesIds,
    });

    it('names the species whose rule changes, and where it moves', () => {
        const result = impact([finland], [finland, uusimaa]);

        expect(result).toEqual([{ id: 10, name: 'Pike', from: 'Finland', to: 'Uusimaa ELY' }]);
    });

    it('leaves out species whose rule is the same either way', () => {
        // Perch is only ruled nationally, and both chains include Finland.
        const result = impact([finland], [finland, uusimaa]);

        expect(result.some(e => e.name === 'Perch')).toBe(false);
    });

    it('reports gaining and losing a rule', () => {
        expect(impact([finland, uusimaa], [finland, lapland]))
            .toEqual([{ id: 10, name: 'Pike', from: 'Uusimaa ELY', to: 'Finland' }]);

        expect(impact([finland, uusimaa], []))
            .toEqual([
                { id: 10, name: 'Pike', from: 'Uusimaa ELY', to: null },
                { id: 20, name: 'Perch', from: 'Finland', to: null },
            ]);
    });

    it('ignores species with a rule set on the water itself', () => {
        // A local rule wins wherever the water sits, so moving it changes
        // nothing for that species.
        expect(impact([finland], [finland, uusimaa], [10])).toEqual([]);
    });

    it('reports nothing when the chain does not change', () => {
        expect(impact([finland, uusimaa], [finland, uusimaa])).toEqual([]);
    });
});

describe('resolveRegionRule', () => {
    const chain = [
        { id: 1, name: 'Finland' },
        { id: 2, name: 'Uusimaa ELY' },
    ];
    const regulations = [
        { id: 900, speciesId: 10, regionId: 1 },
        { id: 901, speciesId: 10, regionId: 2 },
    ];

    it('prefers the most specific region in the chain', () => {
        expect(resolveRegionRule(regulations, chain, 10).rule.id).toBe(901);
    });

    it('falls back up the chain when the specific region has no rule', () => {
        expect(resolveRegionRule([regulations[0]], chain, 10).rule.id).toBe(900);
    });

    it('returns null when nothing in the chain rules the species', () => {
        expect(resolveRegionRule(regulations, chain, 99)).toBeNull();
        expect(resolveRegionRule(regulations, [], 10)).toBeNull();
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

describe('isValidProtectedPeriod', () => {
    it('accepts real dates, including a wrapping period', () => {
        expect(isValidProtectedPeriod(springClosure)).toBe(true);
        expect(isValidProtectedPeriod(winterClosure)).toBe(true);
    });

    it('accepts the end of February, which a yearless period must be able to name', () => {
        expect(isValidProtectedPeriod({ startMonth: 1, startDay: 1, endMonth: 2, endDay: 29 })).toBe(true);
    });

    it('rejects a day its month does not have', () => {
        // A per-field 1-31 range accepts all of these.
        expect(isValidProtectedPeriod({ startMonth: 2, startDay: 30, endMonth: 3, endDay: 1 })).toBe(false);
        expect(isValidProtectedPeriod({ startMonth: 2, startDay: 31, endMonth: 3, endDay: 1 })).toBe(false);
        expect(isValidProtectedPeriod({ startMonth: 4, startDay: 1, endMonth: 4, endDay: 31 })).toBe(false);
        expect(isValidProtectedPeriod({ startMonth: 9, startDay: 31, endMonth: 10, endDay: 1 })).toBe(false);
    });

    it('rejects out-of-range months and missing parts', () => {
        expect(isValidProtectedPeriod({ startMonth: 13, startDay: 1, endMonth: 1, endDay: 1 })).toBe(false);
        expect(isValidProtectedPeriod({ startMonth: 0, startDay: 1, endMonth: 1, endDay: 1 })).toBe(false);
        expect(isValidProtectedPeriod({ startMonth: 1, startDay: 1 })).toBe(false);
        expect(isValidProtectedPeriod(null)).toBe(false);
    });
});

describe('getDaysInMonth', () => {
    it('knows the short months', () => {
        expect(getDaysInMonth(2)).toBe(29);
        expect(getDaysInMonth(4)).toBe(30);
        expect(getDaysInMonth(1)).toBe(31);
    });

    it('returns 0 for a month outside the calendar', () => {
        expect(getDaysInMonth(0)).toBe(0);
        expect(getDaysInMonth(13)).toBe(0);
        expect(getDaysInMonth(undefined)).toBe(0);
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

    it('counts full protection as a restriction', () => {
        // Otherwise a rule saying "this fish may not be taken" renders as
        // "No size or bag limits", which is the opposite of what it says.
        expect(hasRestrictions({ ...emptyRule, isFullyProtected: true })).toBe(true);
    });
});

describe('getAdiposeFinLabel', () => {
    it('labels the two fin states', () => {
        expect(getAdiposeFinLabel('Intact')).toBe('Adipose fin intact');
        expect(getAdiposeFinLabel('Clipped')).toBe('Adipose fin clipped');
    });

    it('returns null for a rule that does not distinguish', () => {
        // Null is the normal case and needs no label — inventing "All fish"
        // would imply a distinction the regulations don't make.
        expect(getAdiposeFinLabel(null)).toBeNull();
        expect(getAdiposeFinLabel(undefined)).toBeNull();
    });

    it('returns null rather than echoing an unknown value', () => {
        expect(getAdiposeFinLabel('Whatever')).toBeNull();
        // Inherited keys must not resolve to something truthy.
        expect(getAdiposeFinLabel('constructor')).toBeNull();
    });
});

describe('getAdiposeFinHint', () => {
    it('glosses each fin state in plain language', () => {
        expect(getAdiposeFinHint('Intact')).toBe('wild fish');
        expect(getAdiposeFinHint('Clipped')).toBe('hatchery-reared');
    });

    it('has nothing to gloss when the rule does not distinguish', () => {
        expect(getAdiposeFinHint(null)).toBeNull();
    });
});

describe('getSpeciesRuleState', () => {
    const inherited = { speciesId: 10, source: 'Region: Uusimaa ELY' };
    const own = { speciesId: 10, source: 'Location' };

    it('is custom when the water has its own rule', () => {
        expect(getSpeciesRuleState(10, [own], [])).toBe('custom');
    });

    it('is follows when the species is on the follow list', () => {
        expect(getSpeciesRuleState(10, [inherited], [10])).toBe('follows');
    });

    it('is follows even when the region turns out to set no rule', () => {
        // The case that cannot be read off the rule list: following and having nothing
        // to inherit produces no rule at all, exactly like never having decided.
        expect(getSpeciesRuleState(10, [], [10])).toBe('follows');
    });

    it('is undecided when nothing has been recorded', () => {
        expect(getSpeciesRuleState(10, [], [])).toBe('undecided');
    });

    it('is undecided for a species whose follow row belongs to another species', () => {
        expect(getSpeciesRuleState(10, [], [20])).toBe('undecided');
    });

    it('reads custom from any variant, not only the first', () => {
        const intact = { speciesId: 10, source: 'Region: Uusimaa ELY', adiposeFin: 'Intact' };
        const clippedOwn = { speciesId: 10, source: 'Location', adiposeFin: 'Clipped' };

        expect(getSpeciesRuleState(10, [intact, clippedOwn], [])).toBe('custom');
    });

    it('survives being called with nothing', () => {
        expect(getSpeciesRuleState(10)).toBe('undecided');
    });
});

describe('getRuleKey', () => {
    it('separates the variants of one species', () => {
        expect(getRuleKey(10, 'Intact')).not.toBe(getRuleKey(10, 'Clipped'));
        expect(getRuleKey(10, 'Intact')).not.toBe(getRuleKey(10, null));
    });

    it('treats a missing fin the same as an explicit null', () => {
        // The two reach it from different places — an absent field on a draft
        // and a null off the wire — and they mean the same rule.
        expect(getRuleKey(10)).toBe(getRuleKey(10, null));
        expect(getRuleKey(10, undefined)).toBe(getRuleKey(10, null));
    });

    it('separates the same fin state on different species', () => {
        expect(getRuleKey(10, 'Intact')).not.toBe(getRuleKey(11, 'Intact'));
    });
});
