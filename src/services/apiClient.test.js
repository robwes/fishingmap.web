import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './apiClient';

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

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('apiClient.getJson', () => {
    it('returns the parsed body on success', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: true, body: [{ id: 1 }] })));

        const result = await apiClient.getJson('http://api.test/things', []);

        expect(result).toEqual([{ id: 1 }]);
    });

    it('returns the fallback on an HTTP error response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 500, body: { error: 'boom' } })));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await apiClient.getJson('http://api.test/things', []);

        expect(result).toEqual([]);
    });

    it('returns the fallback on a network error', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down'); }));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await apiClient.getJson('http://api.test/things');

        expect(result).toBeNull();
    });
});

describe('apiClient.sendForm', () => {
    it('sends credentials and returns the parsed body on success', async () => {
        const fetchMock = vi.fn(async () => fakeResponse({ ok: true, body: { id: 7 } }));
        vi.stubGlobal('fetch', fetchMock);

        const formData = new FormData();
        const result = await apiClient.sendForm('http://api.test/things', 'POST', formData);

        expect(result).toEqual({ id: 7 });
        expect(fetchMock).toHaveBeenCalledWith('http://api.test/things', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
    });

    it('does not hand an error body to the caller on an HTTP error', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 401, body: { title: 'Unauthorized' } })));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await apiClient.sendForm('http://api.test/things', 'POST', new FormData());

        expect(result).toBeNull();
    });
});

describe('apiClient.sendJson', () => {
    it('serializes the body and sets the JSON content type', async () => {
        const fetchMock = vi.fn(async () => fakeResponse({ ok: true, body: { id: 3 } }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await apiClient.sendJson('http://api.test/things/3', 'PATCH', { name: 'Pike' });

        expect(result).toEqual({ id: 3 });
        expect(fetchMock).toHaveBeenCalledWith('http://api.test/things/3', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Pike' })
        });
    });
});

describe('apiClient.requestResult', () => {
    it('returns ok with the parsed body on success', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: true, body: { id: 1 } })));

        const result = await apiClient.requestResult('http://api.test/whoami');

        expect(result).toEqual({ ok: true, status: 200, body: { id: 1 } });
    });

    it('returns the HTTP status without a body on an error response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 401, body: { title: 'Unauthorized' } })));

        const result = await apiClient.requestResult('http://api.test/whoami');

        expect(result).toEqual({ ok: false, status: 401, body: null });
    });

    it('returns status 0 on a network error', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down'); }));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await apiClient.requestResult('http://api.test/whoami');

        expect(result).toEqual({ ok: false, status: 0, body: null });
    });
});

describe('apiClient session refresh', () => {
    it('refreshes the session and retries once after a 401', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(fakeResponse({ ok: false, status: 401 }))
            .mockResolvedValueOnce(fakeResponse({ ok: true }))
            .mockResolvedValueOnce(fakeResponse({ ok: true, body: { id: 1 } }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await apiClient.getJson('http://api.test/things');

        expect(result).toEqual({ id: 1 });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls[1][0]).toContain('/api/auth/refresh');
        expect(fetchMock.mock.calls[1][1]).toEqual({ method: 'POST', credentials: 'include' });
    });

    it('hands the original 401 to the caller when the refresh fails', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(fakeResponse({ ok: false, status: 401 }))
            .mockResolvedValueOnce(fakeResponse({ ok: false, status: 401 }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await apiClient.requestResult('http://api.test/whoami');

        expect(result).toEqual({ ok: false, status: 401, body: null });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not refresh on non-401 errors', async () => {
        const fetchMock = vi.fn(async () => fakeResponse({ ok: false, status: 500 }));
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'log').mockImplementation(() => {});

        await apiClient.getJson('http://api.test/things');

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('shares one refresh between concurrent 401s', async () => {
        let refreshCalls = 0;
        const seen = {};
        const fetchMock = vi.fn(async (url) => {
            if (url.includes('/api/auth/refresh')) {
                refreshCalls += 1;
                await new Promise(resolve => setTimeout(resolve, 10));
                return fakeResponse({ ok: true });
            }
            seen[url] = (seen[url] ?? 0) + 1;
            return seen[url] === 1
                ? fakeResponse({ ok: false, status: 401 })
                : fakeResponse({ ok: true, body: { url } });
        });
        vi.stubGlobal('fetch', fetchMock);

        const [a, b] = await Promise.all([
            apiClient.getJson('http://api.test/a'),
            apiClient.getJson('http://api.test/b')
        ]);

        expect(refreshCalls).toBe(1);
        expect(a).toEqual({ url: 'http://api.test/a' });
        expect(b).toEqual({ url: 'http://api.test/b' });
    });
});

describe('apiClient.requestOk', () => {
    it('returns true on a 2xx response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: true, status: 204 })));

        const result = await apiClient.requestOk('http://api.test/things/1', { method: 'DELETE' });

        expect(result).toBe(true);
    });

    it('returns false on an HTTP error response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 403 })));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await apiClient.requestOk('http://api.test/things/1', { method: 'DELETE' });

        expect(result).toBe(false);
    });

    it('returns false on a network error', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down'); }));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const result = await apiClient.requestOk('http://api.test/things/1', { method: 'DELETE' });

        expect(result).toBe(false);
    });
});
