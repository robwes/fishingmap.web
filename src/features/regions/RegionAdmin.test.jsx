// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegionAdmin from './RegionAdmin';
import { regionService } from '@/shared/services/regionService';
import { regulationService } from '@/shared/services/regulationService';
import { speciesService } from '@/shared/services/speciesService';
import { locationService } from '@/shared/services/locationService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/services/regionService', () => ({
    regionService: { getRegions: vi.fn(), createRegion: vi.fn() },
}));
vi.mock('@/shared/services/regulationService', () => ({
    regulationService: {
        getRegulations: vi.fn(),
        createRegulation: vi.fn(),
        updateRegulation: vi.fn(),
        deleteRegulation: vi.fn(),
    },
}));
vi.mock('@/shared/services/speciesService', () => ({
    speciesService: { getSpecies: vi.fn() },
}));
vi.mock('@/shared/services/locationService', () => ({
    locationService: { getLocationsSummary: vi.fn() },
}));

const showToast = vi.fn();
vi.mock('@/shared/context/ToastContext', () => ({
    useToast: () => showToast,
}));

const finland = { id: 1, name: 'Finland', type: 'Root', parentRegionId: null };
const uusimaa = { id: 2, name: 'Uusimaa ELY', type: 'Ely', parentRegionId: 1 };
const espoo = { id: 5, name: 'Espoo lakes', type: 'ManagementArea', parentRegionId: 2 };

const nationalPikeRule = {
    id: 900, speciesId: 10, regionId: 1, locationIds: [],
    minimumSizeCm: 40, maximumSizeCm: null, bagLimit: null, bagLimitBasis: null,
    isCatchAndReleaseOnly: false, mustReportCatch: false,
    additionalRules: null, protectedPeriods: [],
};
const elyPerchRule = { ...nationalPikeRule, id: 901, speciesId: 20, regionId: 2, minimumSizeCm: 15 };

beforeEach(() => {
    regionService.getRegions.mockResolvedValue([finland, uusimaa, espoo]);
    regulationService.getRegulations.mockResolvedValue([nationalPikeRule, elyPerchRule]);
    speciesService.getSpecies.mockResolvedValue([
        { id: 10, name: 'Pike' },
        { id: 20, name: 'Perch' },
    ]);
    locationService.getLocationsSummary.mockResolvedValue([
        { id: 100, name: 'Kalajärvi', regionId: 5 },
        { id: 101, name: 'Bodom', regionId: 2 },
        { id: 102, name: 'Nuuksio', regionId: null },
    ]);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

let container;

/** Renders the page and waits for its initial loads to settle. */
const renderPage = async () => {
    await act(async () => {
        ({ container } = render(<MemoryRouter><RegionAdmin /></MemoryRouter>));
    });
};

/** Clicks a button by accessible name, wrapped in act. */
const click = async (name) => {
    await act(async () => {
        screen.getByRole('button', { name }).click();
    });
};

/**
 * Selects a region in the tree. Tree buttons carry their tier label too, so
 * the accessible name is "Espoo lakes Management area" — match on a fragment.
 * @param {string} name - The region's name.
 */
const selectRegion = async (name) => {
    await click(new RegExp(`^${name}`));
};

/**
 * The species named in the rule list. Scoped deliberately: the "Add a rule
 * for" picker lists every species as an <option>, so an unscoped text query
 * finds species that have no rule here.
 * @returns {Array<string>} Species names with a rule on the selected region.
 */
const ruledSpecies = () => {
    const list = container.querySelector('.reg-list');
    return list
        ? [...list.querySelectorAll('.species-rule-name')].map(el => el.textContent.trim())
        : [];
};

describe('RegionAdmin', () => {
    it('selects the root region on load', async () => {
        await renderPage();

        expect(screen.getByRole('heading', { level: 2, name: 'Finland' })).toBeTruthy();
    });

    it('shows only the selected region’s own rules', async () => {
        await renderPage();

        // Finland rules Pike; the ELY's Perch rule belongs to another region.
        expect(ruledSpecies()).toEqual(['Pike']);

        await selectRegion('Uusimaa ELY');

        expect(ruledSpecies()).toEqual(['Perch']);
    });

    it('counts every water in the region and below, not just direct members', async () => {
        await renderPage();

        // Finland covers Kalajärvi (via Espoo lakes) and Bodom (via the ELY),
        // but not Nuuksio, which belongs to no region.
        expect(screen.getByText(/apply to 2 waters in this region and below/)).toBeTruthy();

        await selectRegion('Espoo lakes');

        expect(screen.getByText(/apply to 1 water in this region and below/)).toBeTruthy();
    });

    it('lists the waters covered as links', async () => {
        await renderPage();

        expect(screen.getByRole('link', { name: 'Kalajärvi' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Nuuksio' })).toBeNull();
    });

    it('saves a region rule with regionId set and no locationIds', async () => {
        regulationService.updateRegulation.mockResolvedValue({ id: 900 });
        await renderPage();

        await click(/Edit rule/);
        await click(/Save rule/);

        const [, payload] = regulationService.updateRegulation.mock.calls[0];
        expect(payload.regionId).toBe(1);
        expect(payload.locationIds).toEqual([]);
    });

    it('removes a rule only after confirmation', async () => {
        regulationService.deleteRegulation.mockResolvedValue(true);
        await renderPage();

        await click(/Remove$/);
        expect(regulationService.deleteRegulation).not.toHaveBeenCalled();

        await click(/Yes, remove/);
        expect(regulationService.deleteRegulation).toHaveBeenCalledWith(900);
    });

    it('adds a child region one tier below the selected one', async () => {
        regionService.createRegion.mockResolvedValue({ id: 7 });
        await renderPage();

        await click(/Add region under Finland/);
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lapland ELY' } });
        });
        await click(/^Add$/);

        // Tier comes from a name lookup: National's child is Ely, never type + 1.
        expect(regionService.createRegion).toHaveBeenCalledWith({
            name: 'Lapland ELY',
            type: 'Ely',
            parentRegionId: 1,
        });
    });

    it('offers no child tier below a management area', async () => {
        await renderPage();

        await selectRegion('Espoo lakes');

        expect(screen.queryByRole('button', { name: /Add region under/ })).toBeNull();
    });

    it('reports a failed save rather than letting it look successful', async () => {
        regulationService.updateRegulation.mockResolvedValue(null);
        await renderPage();

        await click(/Edit rule/);
        await click(/Save rule/);

        expect(showToast).toHaveBeenCalledWith('The rule could not be saved.', 'error');
    });

    it('says when a region has no rules of its own', async () => {
        await renderPage();

        await selectRegion('Espoo lakes');

        expect(screen.getByText(/No species rules on this region yet/)).toBeTruthy();
    });
});
