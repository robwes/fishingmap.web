import { describe, it, expect, vi, beforeEach } from 'vitest';
import { permitService } from './permitService';

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

describe('permitService.createPermit', () => {
    it('sends FormData with the permit fields', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 2 } }));

        const result = await permitService.createPermit({
            name: 'Uusimaa permit',
            url: 'https://permits.example'
        });

        expect(result).toEqual({ id: 2 });
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://api.test/api/permits');
        expect(options.credentials).toBe('include');
        expect(options.body.get('name')).toBe('Uusimaa permit');
        expect(options.body.get('url')).toBe('https://permits.example');
        expect(options.body.has('id')).toBe(false);
    });

    it('defaults missing fields to empty strings instead of "undefined"', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 2 } }));

        await permitService.createPermit({ name: 'Uusimaa permit' });

        expect(fetchMock.mock.calls[0][1].body.get('url')).toBe('');
    });
});

describe('permitService.updatePermit', () => {
    it('PUTs to the entity URL and includes the id in the payload', async () => {
        const fetchMock = mockFetch(fakeResponse({ ok: true, body: { id: 2 } }));

        await permitService.updatePermit(2, { id: 2, name: 'Uusimaa permit' });

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://api.test/api/permits/2');
        expect(options.method).toBe('PUT');
        expect(options.body.get('id')).toBe('2');
    });
});
