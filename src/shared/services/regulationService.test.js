import { describe, it, expect, vi, beforeEach } from 'vitest';
import { regulationService } from './regulationService';

/**
 * Builds a minimal fetch Response stand-in.
 * @param {Object} options
 * @param {boolean} options.ok - Whether the response is a 2xx.
 * @param {number} [options.status] - HTTP status code.
 * @param {any} [options.body] - Value resolved by response.json().
 * @returns {Object} The fake response.
 */
const fakeResponse = ({ ok, status = ok ? 200 : 500, body = null }) => ({
    ok,
    status,
    json: async () => body
});

/** Installs a fetch mock resolving with the given response and returns it. */
const mockFetch = (response) => {
    const fetchMock = vi.fn(async () => response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
};

/** Parses the JSON body the service sent on its most recent call. */
const sentBody = (fetchMock) => JSON.parse(fetchMock.mock.calls[0][1].body);

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('regulationService.createRegulation', () => {
    it('sends JSON, not FormData', async () => {
        // RegulationsController takes [FromBody]; the other services use
        // FormData only because they carry image uploads.
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({ speciesId: 1, regionId: 2 });

        const [, options] = fetchMock.mock.calls[0];
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(typeof options.body).toBe('string');
        expect(options.credentials).toBe('include');
    });

    it('clears locationIds when the rule is region-scoped', async () => {
        // Scope is XOR — the backend rejects a regulation carrying both.
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({ speciesId: 1, regionId: 2, locationIds: [7, 8] });

        const body = sentBody(fetchMock);
        expect(body.regionId).toBe(2);
        expect(body.locationIds).toEqual([]);
    });

    it('keeps locationIds when the rule is location-scoped', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({ speciesId: 1, locationIds: [7] });

        const body = sentBody(fetchMock);
        expect(body.regionId).toBeNull();
        expect(body.locationIds).toEqual([7]);
    });

    it('sends unset restrictions as null rather than omitting them', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({ speciesId: 1, locationIds: [7] });

        const body = sentBody(fetchMock);
        expect(body.minimumSizeCm).toBeNull();
        expect(body.bagLimit).toBeNull();
        expect(body.bagLimitBasis).toBeNull();
        expect(body.isCatchAndReleaseOnly).toBe(false);
        expect(body.isFullyProtected).toBe(false);
        expect(body.mustReportCatch).toBe(false);
        expect(body.protectedPeriods).toEqual([]);
    });

    it('sends a rule that does not distinguish fin states as null', async () => {
        // Null means "all fish of this species", which is a value the backend
        // resolves on — not an omission it can default away.
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({ speciesId: 1, regionId: 2 });

        expect(sentBody(fetchMock)).toHaveProperty('adiposeFin', null);
    });

    it('sends the fin state and full protection when set', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({
            speciesId: 1,
            regionId: 2,
            adiposeFin: 'Intact',
            isFullyProtected: true,
        });

        const body = sentBody(fetchMock);
        expect(body.adiposeFin).toBe('Intact');
        expect(body.isFullyProtected).toBe(true);
    });

    it('sends protected periods as month/day pairs plus their water qualifier', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({
            speciesId: 1,
            locationIds: [7],
            protectedPeriods: [{ startMonth: 12, startDay: 1, endMonth: 1, endDay: 31, id: 99, extra: 'x' }],
        });

        // Null, not absent: an unqualified closure applies wherever the rule does.
        expect(sentBody(fetchMock).protectedPeriods).toEqual([
            { startMonth: 12, startDay: 1, endMonth: 1, endDay: 31, appliesToWaterType: null }
        ]);
    });

    it('keeps a closure scoped to one kind of water', async () => {
        // Dropping the qualifier would widen a river closure to every lake the rule reaches.
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 1 } }));

        await regulationService.createRegulation({
            speciesId: 1,
            regionId: 1,
            protectedPeriods: [
                { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30, appliesToWaterType: 'RiversAndStreams' },
            ],
        });

        expect(sentBody(fetchMock).protectedPeriods[0].appliesToWaterType).toBe('RiversAndStreams');
    });

    it('returns null and swallows the error when the request fails', async () => {
        mockFetch(fakeResponse({ ok: false, status: 400 }));

        const result = await regulationService.createRegulation({ speciesId: 1, regionId: 2 });

        expect(result).toBeNull();
    });
});

describe('regulationService.updateRegulation', () => {
    it('includes the id in the body as well as the path', async () => {
        // SpeciesRegulationUpdate marks Id [Required].
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 5 } }));

        await regulationService.updateRegulation(5, { speciesId: 1, regionId: 2 });

        const [url] = fetchMock.mock.calls[0];
        expect(url).toContain('/api/regulations/5');
        expect(sentBody(fetchMock).id).toBe(5);
    });
});

describe('regulationService reads', () => {
    it('falls back to an empty list for the species endpoint', async () => {
        mockFetch(fakeResponse({ ok: false, status: 404 }));

        expect(await regulationService.getRegionRulesForSpecies(1)).toEqual([]);
    });

    it('asks the region-scoped path for a species', async () => {
        // The bare species path is reserved for the admin view of per-water exceptions,
        // which needs paging this one does not.
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: [] }));

        await regulationService.getRegionRulesForSpecies(7);

        expect(fetchMock.mock.calls[0][0]).toContain('/api/regulations/species/7/regions');
    });

    it('requests the resolved rules for a location', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: [] }));

        await regulationService.getRulesForLocation(3);

        expect(fetchMock.mock.calls[0][0]).toContain('/api/regulations/location/3');
    });
});
