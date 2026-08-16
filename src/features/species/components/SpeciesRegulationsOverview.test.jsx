// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SpeciesRegulationsOverview from './SpeciesRegulationsOverview';
import { regulationService } from '@/shared/services/regulationService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/services/regulationService', () => ({
    regulationService: { getRegionRulesForSpecies: vi.fn() },
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const finland = { id: 1, name: 'Finland', type: 'Root', parentRegionId: null };
const uusimaa = { id: 2, name: 'Uusimaa', type: 'StateRegion', parentRegionId: 1 };

/** A region-scoped regulation with every restriction unset. */
const rule = (id, overrides = {}) => ({
    id,
    speciesId: 10,
    region: finland,
    adiposeFin: null,
    minimumSizeCm: null,
    maximumSizeCm: null,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    isFullyProtected: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
    ...overrides,
});

const nationalRule = rule(900, { minimumSizeCm: 40 });
const elyRule = rule(901, { region: uusimaa, minimumSizeCm: 60 });

let container;

/**
 * Renders the overview with the given API response.
 * @param {Array<Object>} regulations - What the endpoint returns.
 */
const renderOverview = async (regulations) => {
    regulationService.getRegionRulesForSpecies.mockResolvedValue(regulations);
    await act(async () => {
        ({ container } = render(
            <MemoryRouter><SpeciesRegulationsOverview speciesId={10} /></MemoryRouter>
        ));
    });
};

/** Titles of the rule cards, in render order. */
const cardTitles = () =>
    [...container.querySelectorAll('.scope-rule-title')].map(el => el.textContent);

describe('SpeciesRegulationsOverview', () => {
    beforeEach(() => {
        regulationService.getRegionRulesForSpecies.mockResolvedValue([]);
    });

    it('splits the rules into national and regional tiers', async () => {
        await renderOverview([nationalRule, elyRule]);

        expect(cardTitles()).toEqual(['All of Finland', 'Uusimaa']);
    });

    it('keeps the order the API returned rather than re-sorting', async () => {
        // The endpoint already orders national -> regions by tier.
        const otherRegional = rule(904, { region: { id: 3, name: 'Ahvenanmaa', type: 'StateRegion', parentRegionId: 1 } });
        await renderOverview([nationalRule, elyRule, otherRegional]);

        expect(cardTitles()).toEqual(['All of Finland', 'Uusimaa', 'Ahvenanmaa']);
    });

    it('says what is missing rather than leaving a tier blank', async () => {
        await renderOverview([elyRule]);

        expect(screen.getByText(/No national rule recorded/)).toBeTruthy();
    });

    it('handles a species with no rules anywhere', async () => {
        await renderOverview([]);

        expect(cardTitles()).toEqual([]);
        expect(screen.getByText(/No national rule recorded/)).toBeTruthy();
        expect(screen.getByText(/No regional rules recorded/)).toBeTruthy();
    });

    it('describes an empty tier as missing data, not as an absent law', async () => {
        // An empty table means nobody has entered the rule, which is not the same as the
        // rule not existing — and the second reading is the dangerous one.
        await renderOverview([]);

        expect(screen.queryByText(/the national baseline applies everywhere/)).toBeNull();
        expect(screen.queryByText(/only the regional rules/i)).toBeNull();
        expect(screen.getByText(/Only the rules recorded here are shown/)).toBeTruthy();
    });

    it('renders the restrictions on each rule', async () => {
        await renderOverview([nationalRule, elyRule]);

        expect(screen.getByText('Min 40 cm')).toBeTruthy();
        expect(screen.getByText('Min 60 cm')).toBeTruthy();
    });

    describe('scope of the page', () => {
        it('asks only for the region-scoped rules', async () => {
            // Per-water exceptions are one entry per water that diverges. Fetching them to
            // draw a page that never shows them would grow with the site for nothing.
            await renderOverview([nationalRule]);

            expect(regulationService.getRegionRulesForSpecies).toHaveBeenCalledWith(10);
        });

        it('says individual waters can differ, so the page does not read as complete', async () => {
            await renderOverview([nationalRule]);

            expect(screen.getByText(/individual waters can set their own/)).toBeTruthy();
            expect(screen.getByText(/Check the page for the water you are fishing/)).toBeTruthy();
        });

        it('links no waters — that view belongs to an admin screen', async () => {
            await renderOverview([nationalRule, elyRule]);

            expect(container.querySelectorAll('a')).toHaveLength(0);
        });
    });

    describe('adipose fin variants', () => {
        const intact = rule(905, { adiposeFin: 'Intact', isFullyProtected: true });
        const clipped = rule(906, { adiposeFin: 'Clipped', minimumSizeCm: 50 });

        it('shows every national rule, not just the first', async () => {
            // A tier can hold one rule per fin state. Finding the first would hide the
            // other half of the species a reader came here for.
            await renderOverview([intact, clipped]);

            expect(cardTitles()).toEqual(['All of Finland', 'All of Finland']);
        });

        it('says which fish each rule covers', async () => {
            await renderOverview([intact, clipped]);

            expect(screen.getByText('Adipose fin intact')).toBeTruthy();
            expect(screen.getByText('Adipose fin clipped')).toBeTruthy();
            expect(screen.getByText('wild fish')).toBeTruthy();
            expect(screen.getByText('hatchery-reared')).toBeTruthy();
        });

        it('states full protection rather than reading as unregulated', async () => {
            await renderOverview([intact, clipped]);

            expect(screen.getByText('Fully protected')).toBeTruthy();
            expect(screen.queryByText('No size or bag limits')).toBeNull();
        });

        it('labels nothing when a rule does not distinguish fin states', async () => {
            await renderOverview([nationalRule]);

            expect(screen.queryByText(/Adipose fin/)).toBeNull();
        });
    });
});
