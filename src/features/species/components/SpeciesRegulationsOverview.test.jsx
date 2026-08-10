// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SpeciesRegulationsOverview from './SpeciesRegulationsOverview';
import { regulationService } from '@/shared/services/regulationService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/services/regulationService', () => ({
    regulationService: { getRegulationsForSpecies: vi.fn() },
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

/** A regulation with every restriction unset. */
const rule = (id, overrides = {}) => ({
    id,
    speciesId: 10,
    region: null,
    locations: [],
    minimumSizeCm: null,
    maximumSizeCm: null,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
    ...overrides,
});

const nationalRule = rule(900, {
    region: { id: 1, name: 'Finland', type: 'Root', parentRegionId: null },
    minimumSizeCm: 40,
});
const elyRule = rule(901, {
    region: { id: 2, name: 'Uusimaa ELY', type: 'Ely', parentRegionId: 1 },
    minimumSizeCm: 60,
});
const oneWaterRule = rule(902, {
    locations: [{ id: 7, name: 'Kalajärvi' }],
    isCatchAndReleaseOnly: true,
});
const sharedWaterRule = rule(903, {
    locations: [{ id: 7, name: 'Kalajärvi' }, { id: 8, name: 'Bodom' }],
    bagLimit: 2,
    bagLimitBasis: 'Day',
});

let container;

/**
 * Renders the overview with the given API response.
 * @param {Array<Object>} regulations - What the endpoint returns.
 */
const renderOverview = async (regulations) => {
    regulationService.getRegulationsForSpecies.mockResolvedValue(regulations);
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
        regulationService.getRegulationsForSpecies.mockResolvedValue([]);
    });

    it('splits the rules into national, regional and per-water tiers', async () => {
        await renderOverview([nationalRule, elyRule, oneWaterRule]);

        expect(cardTitles()).toEqual(['All of Finland', 'Uusimaa ELY', 'Kalajärvi']);
    });

    it('keeps the order the API returned rather than re-sorting', async () => {
        // The endpoint already orders national -> regions by tier -> waters.
        const otherEly = rule(904, {
            region: { id: 3, name: 'Ahvenanmaa ELY', type: 'Ely', parentRegionId: 1 },
        });
        await renderOverview([nationalRule, elyRule, otherEly]);

        expect(cardTitles()).toEqual(['All of Finland', 'Uusimaa ELY', 'Ahvenanmaa ELY']);
    });

    it('labels a rule covering several waters by their count', async () => {
        await renderOverview([sharedWaterRule]);

        expect(cardTitles()).toEqual(['2 waters']);
        expect(screen.getByText('Shared rule')).toBeTruthy();
    });

    it('links the waters a local rule applies to', async () => {
        await renderOverview([sharedWaterRule]);

        expect(screen.getByRole('link', { name: 'Kalajärvi' })).toHaveProperty(
            'href', expect.stringContaining('/locations/7')
        );
        expect(screen.getByRole('link', { name: 'Bodom' })).toBeTruthy();
    });

    it('says what is missing rather than leaving a tier blank', async () => {
        await renderOverview([elyRule]);

        expect(screen.getByText(/No national rule/)).toBeTruthy();
        expect(screen.getByText(/No water sets its own rule/)).toBeTruthy();
    });

    it('handles a species with no rules anywhere', async () => {
        await renderOverview([]);

        expect(cardTitles()).toEqual([]);
        expect(screen.getByText(/No national rule/)).toBeTruthy();
        expect(screen.getByText(/No region sets its own rule/)).toBeTruthy();
        expect(screen.getByText(/No water sets its own rule/)).toBeTruthy();
    });

    it('renders the restrictions on each rule', async () => {
        await renderOverview([nationalRule, sharedWaterRule]);

        expect(screen.getByText('Min 40 cm')).toBeTruthy();
        expect(screen.getByText('2 per day')).toBeTruthy();
    });

    describe('adipose fin variants', () => {
        const finland = { id: 1, name: 'Finland', type: 'Root', parentRegionId: null };
        const intact = rule(905, {
            region: finland,
            adiposeFin: 'Intact',
            isFullyProtected: true,
        });
        const clipped = rule(906, {
            region: finland,
            adiposeFin: 'Clipped',
            minimumSizeCm: 50,
        });

        it('shows every national rule, not just the first', async () => {
            // A tier can hold one rule per fin state. Finding the first would
            // hide the other half of the species a reader came here for.
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
