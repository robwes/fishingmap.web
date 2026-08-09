// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import EditRegulationsPanel from './EditRegulationsPanel';
import { regulationService } from '@/shared/services/regulationService';
import { locationService } from '@/shared/services/locationService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/services/regulationService', () => ({
    regulationService: {
        createRegulation: vi.fn(),
        updateRegulation: vi.fn(),
        deleteRegulation: vi.fn(),
    },
}));

vi.mock('@/shared/services/locationService', () => ({
    locationService: { getLocation: vi.fn() },
}));

// The panel builds the region chain from the full region list.
vi.mock('@/shared/services/regionService', () => ({
    regionService: { getRegions: vi.fn(async () => []) },
}));

const showToast = vi.fn();
vi.mock('@/shared/context/ToastContext', () => ({
    useToast: () => showToast,
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

beforeEach(() => {
    locationService.getLocation.mockResolvedValue({ id: 1, species: [], speciesRules: [] });
});

const pike = { id: 10, name: 'Pike' };

/**
 * Builds a location carrying one species and the given resolved rule.
 * @param {Object|null} rule - The rule for the species, or null for none.
 * @returns {Object} A location shaped like GET /api/locations/{id}.
 */
const locationWith = (rule) => ({
    id: 1,
    name: 'Kalajärvi',
    region: { id: 5, name: 'Espoo lakes', type: 'ManagementArea', parentRegionId: 2 },
    species: [pike],
    speciesRules: rule ? [rule] : [],
});

const inheritedRule = {
    speciesId: 10,
    regulationId: 99,
    locationIds: [],
    source: 'Region: Uusimaa ELY',
    minimumSizeCm: 40,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
    fallsBackTo: null,
};

const ownRule = {
    ...inheritedRule,
    regulationId: 101,
    locationIds: [1],
    source: 'Location',
    minimumSizeCm: 50,
    fallsBackTo: { ...inheritedRule, source: 'Region: Uusimaa ELY', fallsBackTo: null },
};

const sharedRule = { ...ownRule, regulationId: 105, locationIds: [1, 7, 9] };

/**
 * Renders the panel for a location.
 * @param {Object} location - The location being edited.
 * @param {boolean} [canEdit] - Whether the user may write regulations.
 */
const renderPanel = (location, canEdit = true) => {
    render(
        <EditRegulationsPanel
            location={location}
            canEdit={canEdit}
            onLocationUpdated={vi.fn()}
        />
    );
};

/** Clicks a button by its accessible name, wrapped in act. */
const click = async (name) => {
    await act(async () => {
        screen.getByRole('button', { name }).click();
    });
};

describe('EditRegulationsPanel', () => {
    it('offers an override rather than an edit for an inherited rule', () => {
        // Editing the region's rule here would change every water under it.
        renderPanel(locationWith(inheritedRule));

        expect(screen.getByRole('button', { name: /Override for this water/ })).toBeTruthy();
        expect(screen.queryByRole('button', { name: /^Edit rule/ })).toBeNull();
    });

    it('locks a rule shared with other waters and says how many', () => {
        renderPanel(locationWith(sharedRule));

        expect(screen.getByText(/also applies to 2 other waters/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Edit rule/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /Revert/ })).toBeNull();
    });

    it('names what a revert would fall back to', () => {
        renderPanel(locationWith(ownRule));

        expect(screen.getByRole('button', { name: /Revert to inherited rule/ })).toBeTruthy();
    });

    it('offers removal instead of revert when nothing would take over', () => {
        renderPanel(locationWith({ ...ownRule, fallsBackTo: null }));

        expect(screen.getByRole('button', { name: /Remove rule/ })).toBeTruthy();
    });

    it('hides every action from a user who cannot write regulations', () => {
        renderPanel(locationWith(ownRule), false);

        expect(screen.queryByRole('button', { name: /Edit rule/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /Revert/ })).toBeNull();
        // The rule itself still reads — only the actions are withheld.
        expect(screen.getByText('Min 50 cm')).toBeTruthy();
    });

    it('creates a new regulation when overriding an inherited rule', async () => {
        regulationService.createRegulation.mockResolvedValue({ id: 200 });
        renderPanel(locationWith(inheritedRule));

        await click(/Override for this water/);
        await click(/Save rule/);

        expect(regulationService.createRegulation).toHaveBeenCalledTimes(1);
        expect(regulationService.updateRegulation).not.toHaveBeenCalled();

        // Seeded from the inherited rule so the maintainer edits a difference,
        // not a blank form, and scoped to this water only.
        const draft = regulationService.createRegulation.mock.calls[0][0];
        expect(draft.minimumSizeCm).toBe(40);
        expect(draft.locationIds).toEqual([1]);
    });

    it('updates in place when the water already has its own rule', async () => {
        regulationService.updateRegulation.mockResolvedValue({ id: 101 });
        renderPanel(locationWith(ownRule));

        await click(/^Edit rule/);
        await click(/Save rule/);

        expect(regulationService.updateRegulation).toHaveBeenCalledWith(101, expect.anything());
        expect(regulationService.createRegulation).not.toHaveBeenCalled();
    });

    it('reports a failed save instead of letting it look successful', async () => {
        regulationService.createRegulation.mockResolvedValue(null);
        renderPanel(locationWith(inheritedRule));

        await click(/Override for this water/);
        await click(/Save rule/);

        expect(showToast).toHaveBeenCalledWith('The rule could not be saved.', 'error');
        expect(locationService.getLocation).not.toHaveBeenCalled();
    });

    it('deletes the local rule on a confirmed revert', async () => {
        regulationService.deleteRegulation.mockResolvedValue(true);
        renderPanel(locationWith(ownRule));

        await click(/Revert to inherited rule/);
        await click(/Yes, revert/);

        expect(regulationService.deleteRegulation).toHaveBeenCalledWith(101);
    });

    it('does not delete anything when the revert is dismissed', async () => {
        renderPanel(locationWith(ownRule));

        await click(/Revert to inherited rule/);
        await click(/Keep/);

        expect(regulationService.deleteRegulation).not.toHaveBeenCalled();
    });

    it('says so when the water lists no species yet', () => {
        renderPanel({ ...locationWith(null), species: [] });

        expect(screen.getByText(/No species listed for this water yet/)).toBeTruthy();
    });
});
