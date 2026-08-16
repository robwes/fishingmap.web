// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditRegulationsPanel from './EditRegulationsPanel';
import { regulationService } from '@/shared/services/regulationService';
import { locationService } from '@/shared/services/locationService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/services/regulationService', () => ({
    regulationService: {
        getRegulations: vi.fn(),
        createRegulation: vi.fn(),
        updateRegulation: vi.fn(),
        deleteRegulation: vi.fn(),
        setFollowsRegion: vi.fn(),
    },
}));

vi.mock('@/shared/services/locationService', () => ({
    locationService: { getLocation: vi.fn() },
}));

// The panel builds the region chain from the full region list, and seeds a custom rule for
// an undecided species from what that chain would give it.
vi.mock('@/shared/services/regionService', () => ({
    regionService: {
        getRegions: vi.fn(async () => [
            { id: 1, name: 'Finland', type: 'Root', parentRegionId: null },
            { id: 2, name: 'Uusimaa', type: 'StateRegion', parentRegionId: 1 },
            { id: 5, name: 'Espoo lakes', type: 'ManagementArea', parentRegionId: 2 },
        ]),
    },
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
    regulationService.getRegulations.mockResolvedValue([]);
    regulationService.setFollowsRegion.mockResolvedValue(true);
});

const pike = { id: 10, name: 'Pike' };

/**
 * Builds a location carrying one species and the given resolved rule.
 *
 * An inherited rule only reaches a water that follows its region, so the follow list is
 * derived from the rule's source rather than passed separately — a fixture where the two
 * disagree could not come back from the API.
 * @param {Object|null} rule - The rule for the species, or null for none.
 * @returns {Object} A location shaped like GET /api/locations/{id}.
 */
const locationWith = (rule) => ({
    id: 1,
    name: 'Kalajärvi',
    region: { id: 5, name: 'Espoo lakes', type: 'ManagementArea', parentRegionId: 2 },
    species: [pike],
    speciesRules: rule ? [rule] : [],
    followsRegionSpeciesIds: rule && rule.source !== 'Location' ? [rule.speciesId] : [],
});

const inheritedRule = {
    speciesId: 10,
    regulationId: 99,
    locationIds: [],
    source: 'Region: Uusimaa',
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
    fallsBackTo: { ...inheritedRule, source: 'Region: Uusimaa', fallsBackTo: null },
};

const sharedRule = { ...ownRule, regulationId: 105, locationIds: [1, 7, 9] };

/**
 * Renders the panel for a location.
 * @param {Object} location - The location being edited.
 * @param {boolean} [canEdit] - Whether the user may write regulations.
 */
const renderPanel = (location, canEdit = true) => {
    render(
        <MemoryRouter>
            <EditRegulationsPanel
                location={location}
                canEdit={canEdit}
                onLocationUpdated={vi.fn()}
            />
        </MemoryRouter>
    );
};

/** Clicks a button by its accessible name, wrapped in act. */
const click = async (name) => {
    await act(async () => {
        screen.getByRole('button', { name }).click();
    });
};

describe('EditRegulationsPanel', () => {
    it('offers a custom rule rather than an edit for an inherited rule', () => {
        // Editing the region's rule here would change every water under it.
        renderPanel(locationWith(inheritedRule));

        expect(screen.getByRole('button', { name: /Custom rule/ })).toBeTruthy();
        expect(screen.queryByRole('button', { name: /^Edit rule/ })).toBeNull();
    });

    it('shows which of the three states a species is in', () => {
        renderPanel(locationWith(inheritedRule));

        expect(screen.getByRole('button', { name: /Follow region/ }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: /Not set/ }).getAttribute('aria-pressed')).toBe('false');
    });

    it('locks a rule shared with other waters and says how many', () => {
        renderPanel(locationWith(sharedRule));

        expect(screen.getByText(/also applies to 2 other waters/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Edit rule/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /Revert/ })).toBeNull();
    });

    it('names what leaving a custom rule would fall back to', async () => {
        renderPanel(locationWith(ownRule));

        await click(/Follow region/);

        expect(screen.getByText(/fall back to the Uusimaa rule/)).toBeTruthy();
    });

    it('hides every action from a user who cannot write regulations', () => {
        renderPanel(locationWith(ownRule), false);

        expect(screen.queryByRole('button', { name: /Edit rule/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /Follow region/ })).toBeNull();
        // The rule itself still reads — only the actions are withheld.
        expect(screen.getByText('Min 50 cm')).toBeTruthy();
    });

    it('creates a new regulation when overriding an inherited rule', async () => {
        regulationService.createRegulation.mockResolvedValue({ id: 200 });
        renderPanel(locationWith(inheritedRule));

        await click(/Custom rule/);
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

        await click(/Custom rule/);
        await click(/Save rule/);

        expect(showToast).toHaveBeenCalledWith('The rule could not be saved.', 'error');
        expect(locationService.getLocation).not.toHaveBeenCalled();
    });

    it('deletes the local rule before the water can follow its region again', async () => {
        // Ordering is not incidental: the backend refuses to start following while the
        // water still has its own rule for that species.
        regulationService.deleteRegulation.mockResolvedValue(true);
        renderPanel(locationWith(ownRule));

        await click(/Follow region/);
        await click(/Yes, delete it/);

        expect(regulationService.deleteRegulation).toHaveBeenCalledWith(101);
        expect(regulationService.setFollowsRegion).toHaveBeenCalledWith(1, 10, true);
    });

    it('does not delete anything when leaving a custom rule is dismissed', async () => {
        renderPanel(locationWith(ownRule));

        await click(/Follow region/);
        await click(/Keep the rule/);

        expect(regulationService.deleteRegulation).not.toHaveBeenCalled();
        expect(regulationService.setFollowsRegion).not.toHaveBeenCalled();
    });

    it('does not start following when deleting the custom rule failed', async () => {
        // Otherwise the backend rejects the follow and the UI reports a half-done change.
        regulationService.deleteRegulation.mockResolvedValue(false);
        renderPanel(locationWith(ownRule));

        await click(/Follow region/);
        await click(/Yes, delete it/);

        expect(regulationService.setFollowsRegion).not.toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledWith('The rule could not be removed.', 'error');
    });

    it('says so when the water lists no species yet', () => {
        renderPanel({ ...locationWith(null), species: [] });

        expect(screen.getByText(/No species listed for this water yet/)).toBeTruthy();
    });

    describe('adipose fin variants', () => {
        const intact = {
            ...inheritedRule,
            regulationId: 300,
            adiposeFin: 'Intact',
            minimumSizeCm: null,
            isFullyProtected: true,
        };
        const clipped = { ...inheritedRule, regulationId: 301, adiposeFin: 'Clipped', minimumSizeCm: 50 };

        /** A location whose one species resolves to several rules. */
        const locationWithRules = (...rules) => ({
            ...locationWith(null),
            speciesRules: rules,
            followsRegionSpeciesIds: rules.some(r => r.source !== 'Location') ? [10] : [],
        });

        it('gives each fin state its own row', () => {
            renderPanel(locationWithRules(intact, clipped));

            expect(screen.getByText('Adipose fin intact')).toBeTruthy();
            expect(screen.getByText('Adipose fin clipped')).toBeTruthy();
        });

        it('offers the state choice once for the species, not once per variant', () => {
            // The decision is about the species. Two controls would let a water follow for
            // one fin state and not the other, which the model does not represent.
            renderPanel(locationWithRules(intact, clipped));

            expect(screen.getAllByRole('button', { name: /Follow region/ })).toHaveLength(1);
        });

        it('keeps the fin state when overriding, rather than widening the rule', async () => {
            // An override seeded from "trout with an intact fin" must stay about
            // the same fish — dropping the fin would silently apply it to all of
            // them and wipe the distinction at this water.
            regulationService.createRegulation.mockResolvedValue({ id: 400 });
            renderPanel(locationWithRules(intact, clipped));

            await click(/Custom rule/);
            await click(/Save rule/);

            const draft = regulationService.createRegulation.mock.calls[0][0];
            expect(draft.adiposeFin).toBe('Intact');
            expect(draft.isFullyProtected).toBe(true);
            expect(draft.locationIds).toEqual([1]);
        });

        it('does not offer to change the fin state from a water', () => {
            // Drawing a new distinction is a regional decision; this panel only
            // overrides the rules that already reach the water.
            renderPanel(locationWithRules(intact, clipped));

            expect(screen.queryByLabelText('Applies to')).toBeNull();
        });

        it('updates the right variant in place when the water owns one', async () => {
            regulationService.updateRegulation.mockResolvedValue({ id: 302 });
            const ownClipped = {
                ...clipped,
                regulationId: 302,
                locationIds: [1],
                source: 'Location',
            };
            renderPanel(locationWithRules(intact, ownClipped));

            await click(/^Edit rule/);
            await click(/Save rule/);

            expect(regulationService.updateRegulation).toHaveBeenCalledWith(302, expect.objectContaining({
                adiposeFin: 'Clipped',
            }));
        });

        it('removes every custom rule for the species when it stops being custom', async () => {
            // The state is per species, so leaving Custom cannot leave one variant's rule
            // behind — the species would then be half custom and half something else.
            regulationService.deleteRegulation.mockResolvedValue(true);
            const own = (id, fin) => ({
                ...clipped,
                regulationId: id,
                adiposeFin: fin,
                locationIds: [1],
                source: 'Location',
                fallsBackTo: null,
            });
            renderPanel(locationWithRules(own(302, 'Clipped'), own(303, 'Intact')));

            await click(/Not set/);
            await click(/Yes, delete it/);

            expect(regulationService.deleteRegulation).toHaveBeenCalledWith(302);
            expect(regulationService.deleteRegulation).toHaveBeenCalledWith(303);
        });
    });

    describe('opt-in inheritance', () => {
        /** A location whose species has no decision recorded at all. */
        const undecided = { ...locationWith(null), speciesRules: [], followsRegionSpeciesIds: [] };

        it('warns that an undecided species publishes nothing, without implying it is unrestricted', () => {
            renderPanel(undecided);

            expect(screen.getByText(/Nothing is published for this species here/)).toBeTruthy();
            expect(screen.getByText(/National and regional rules still apply/)).toBeTruthy();
        });

        it('starts a species following its region on request', async () => {
            renderPanel(undecided);

            await click(/Follow region/);

            expect(regulationService.setFollowsRegion).toHaveBeenCalledWith(1, 10, true);
            // Nothing to delete — going from undecided destroys nothing, so no confirmation.
            expect(regulationService.deleteRegulation).not.toHaveBeenCalled();
        });

        it('stops a following species without deleting anything', async () => {
            renderPanel(locationWith(inheritedRule));

            await click(/Not set/);

            expect(regulationService.setFollowsRegion).toHaveBeenCalledWith(1, 10, false);
            expect(regulationService.deleteRegulation).not.toHaveBeenCalled();
        });

        it('seeds a custom rule for an undecided species from what it would inherit', async () => {
            // Nothing resolves for an undecided species, so the seed has to come from the
            // region cascade computed here — otherwise the form opens blank.
            regulationService.getRegulations.mockResolvedValue([
                { id: 77, speciesId: 10, regionId: 5, minimumSizeCm: 35, protectedPeriods: [] },
            ]);
            regulationService.createRegulation.mockResolvedValue({ id: 500 });
            renderPanel(undecided);
            // The seed needs both the region list and the regulations to have arrived.
            await act(async () => {});

            await click(/Custom rule/);
            await click(/Save rule/);

            expect(regulationService.createRegulation.mock.calls[0][0].minimumSizeCm).toBe(35);
        });

        it('reports a failed state change rather than showing it as done', async () => {
            regulationService.setFollowsRegion.mockResolvedValue(false);
            renderPanel(undecided);

            await click(/Follow region/);

            expect(showToast).toHaveBeenCalledWith('The change could not be saved.', 'error');
        });
    });
});
