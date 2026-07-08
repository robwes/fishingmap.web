import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speciesService } from './speciesService';

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

describe('speciesService.createSpecies', () => {
    it('sends FormData with the species fields and image files', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 3 } }));
        const image = new File(['x'], 'pike.png', { type: 'image/png' });

        const result = await speciesService.createSpecies({
            name: 'Pike',
            scientificName: 'Esox lucius',
            description: 'Toothy',
            images: [image]
        });

        expect(result).toEqual({ id: 3 });
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://api.test/api/species');
        expect(options.credentials).toBe('include');
        expect(options.body.get('name')).toBe('Pike');
        expect(options.body.get('scientificName')).toBe('Esox lucius');
        expect(options.body.getAll('images')).toHaveLength(1);
        expect(options.body.has('id')).toBe(false);
    });

    it('defaults missing text fields to empty strings instead of "undefined"', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 3 } }));

        await speciesService.createSpecies({ name: 'Pike' });

        const { body } = fetchMock.mock.calls[0][1];
        expect(body.get('scientificName')).toBe('');
        expect(body.get('description')).toBe('');
    });
});

describe('speciesService.updateSpecies', () => {
    it('PUTs to the entity URL and includes the id in the payload', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 3 } }));

        await speciesService.updateSpecies(3, { id: 3, name: 'Pike' });

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://api.test/api/species/3');
        expect(options.method).toBe('PUT');
        expect(options.body.get('id')).toBe('3');
    });
});
