// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import EditBasicInfoPanel from './EditBasicInfoPanel';
import { locationService } from '@/shared/services/locationService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/services/locationService', () => ({
    locationService: { patchLocationInfo: vi.fn() },
}));

const finland = { id: 1, name: 'Finland', type: 'Root', parentRegionId: null };
const uusimaa = { id: 2, name: 'Uusimaa', type: 'StateRegion', parentRegionId: 1 };
const espoo = { id: 5, name: 'Espoo lakes', type: 'ManagementArea', parentRegionId: 2 };
const regions = [finland, uusimaa, espoo];

const regulations = [
    { id: 900, speciesId: 10, regionId: 1 },  // Pike, nationally
    { id: 901, speciesId: 10, regionId: 2 },  // Pike, stricter in Uusimaa
];

const location = {
    id: 7,
    name: 'Kalajärvi',
    description: 'A quiet lake.',
    rules: 'No motorboats.',
    region: finland,
    species: [{ id: 10, name: 'Pike' }],
    speciesRules: [],
};

beforeEach(() => {
    locationService.patchLocationInfo.mockResolvedValue({ ...location, id: 7 });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

/**
 * Renders the panel.
 * @param {Object} [overrides] - Fields to override on the location.
 */
let container;

const renderPanel = (overrides = {}) => {
    ({ container } = render(
        <EditBasicInfoPanel
            location={{ ...location, ...overrides }}
            regions={regions}
            regulations={regulations}
            onLocationUpdated={vi.fn()}
        />
    ));
};

/**
 * Text of a region-field region, scoped deliberately: every region name also
 * appears as an <option>, so an unscoped query matches the picker itself.
 * @param {string} selector - Class selector within the field.
 * @returns {string} The element's text, or '' when it isn't rendered.
 */
const textOf = (selector) => container.querySelector(selector)?.textContent ?? '';

/** Chooses a region in the picker. */
const selectRegion = async (value) => {
    await act(async () => {
        fireEvent.change(screen.getByLabelText('Region'), { target: { value } });
    });
};

/** Submits the form. */
const save = async () => {
    await act(async () => {
        screen.getByRole('button', { name: 'Save' }).click();
    });
};

describe('EditBasicInfoPanel region picker', () => {
    it('shows the water’s current region and its inheritance chain', () => {
        renderPanel({ region: espoo });

        expect(screen.getByLabelText('Region').value).toBe('5');
        expect(textOf('.region-chain')).toContain('Finland');
        expect(textOf('.region-chain')).toContain('Uusimaa');
        expect(textOf('.region-chain')).toContain('Espoo lakes');
    });

    it('offers a way out of every region', () => {
        renderPanel();

        expect(screen.getByRole('option', { name: 'Not part of a region' })).toBeTruthy();
    });

    it('names the rules a region change would rewrite, before saving', async () => {
        renderPanel();

        await selectRegion('2');

        expect(textOf('.region-impact-head')).toMatch(/changes 1 species rule at this water/);
        expect(textOf('.region-impact-list')).toContain('Pike');
        expect(textOf('.region-impact-list')).toContain('Finland');
        expect(textOf('.region-impact-list')).toContain('Uusimaa');
    });

    it('says plainly when a region change rewrites nothing', async () => {
        // Espoo lakes has no rules of its own, so Pike still resolves to
        // Uusimaa's rule either way.
        renderPanel({ region: uusimaa });

        await selectRegion('5');

        expect(screen.getByText(/No species rules change/)).toBeTruthy();
    });

    it('leaves a species alone when the rule is set on this water', async () => {
        renderPanel({
            speciesRules: [{ speciesId: 10, source: 'Location', regulationId: 500, locationIds: [7] }],
        });

        await selectRegion('2');

        expect(screen.getByText(/No species rules change/)).toBeTruthy();
    });

    it('sends the chosen region id on save', async () => {
        renderPanel();

        await selectRegion('2');
        await save();

        expect(locationService.patchLocationInfo).toHaveBeenCalledWith(7, expect.objectContaining({
            regionId: 2,
        }));
    });

    it('sends null when the water is taken out of every region', async () => {
        // LocationInfoPatch treats an explicit null as "clear", which is what
        // "Not part of a region" has to mean.
        renderPanel();

        await selectRegion('');
        await save();

        expect(locationService.patchLocationInfo).toHaveBeenCalledWith(7, expect.objectContaining({
            regionId: null,
        }));
    });
});
