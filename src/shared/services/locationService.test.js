import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationService } from './locationService';

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

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('locationService list query strings', () => {
    it('requests the bare summary endpoint when no filters are set', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: [] }));

        await locationService.getLocationsSummary();

        expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/locations/summary');
    });

    it('writes search, repeated species ids, origin and radius', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: [] }));

        await locationService.getLocationsSummary('pike', [1, 2], 25, { latitude: 60.1, longitude: 24.9 });

        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(url.searchParams.get('search')).toBe('pike');
        expect(url.searchParams.getAll('sIds')).toEqual(['1', '2']);
        expect(url.searchParams.get('orgLat')).toBe('60.1');
        expect(url.searchParams.get('orgLng')).toBe('24.9');
        expect(url.searchParams.get('radius')).toBe('25');
    });

    it('omits the radius when there is no origin (no geolocation)', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: [] }));

        await locationService.getLocationsSummary('', [], 25, null);

        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(url.searchParams.has('radius')).toBe(false);
        expect(url.searchParams.has('orgLat')).toBe(false);
    });
});

describe('locationService.createLocation', () => {
    it('sends FormData with stringified nested values and returns the entity', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 5 } }));

        const result = await locationService.createLocation({
            name: 'Test lake',
            species: [{ id: 1, name: 'Pike' }],
            permits: [],
            geometry: '{"type":"Feature"}',
            navigationPosition: { latitude: 60, longitude: 24 },
        });

        expect(result).toEqual({ id: 5 });
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://api.test/api/locations');
        expect(options.credentials).toBe('include');
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.body.get('name')).toBe('Test lake');
        expect(options.body.get('species')).toBe('[{"id":1,"name":"Pike"}]');
        expect(options.body.get('navigationposition')).toBe('{"latitude":60,"longitude":24}');
    });

    it('returns null when the backend rejects the request', async () => {
        mockFetch(fakeResponse({ ok: false, status: 401, body: { title: 'Unauthorized' } }));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await locationService.createLocation({ name: 'Test lake' });

        expect(result).toBeNull();
    });
});

describe('locationService.deleteLocation', () => {
    it('reflects the real HTTP outcome', async () => {
        mockFetch(fakeResponse({ ok: true, status: 204 }));
        expect(await locationService.deleteLocation(1)).toBe(true);

        mockFetch(fakeResponse({ ok: false, status: 403 }));
        vi.spyOn(console, 'log').mockImplementation(() => {});
        expect(await locationService.deleteLocation(1)).toBe(false);
    });
});
