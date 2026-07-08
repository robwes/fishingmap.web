import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from './authService';

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

describe('authService.getSession', () => {
    it('returns authenticated with the user when whoami succeeds', async () => {
        const user = { id: 1, userName: 'rob', roles: [{ id: 1, name: 'Administrator' }] };
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: true, body: user })));

        const session = await authService.getSession();

        expect(session).toEqual({ status: 'authenticated', user });
    });

    it('returns unauthenticated when the backend rejects the session', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 401 })));

        const session = await authService.getSession();

        expect(session).toEqual({ status: 'unauthenticated' });
    });

    it('returns unknown when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down'); }));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const session = await authService.getSession();

        expect(session).toEqual({ status: 'unknown' });
    });

    it('returns unknown on a server error so callers keep the stored session', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 500 })));

        const session = await authService.getSession();

        expect(session).toEqual({ status: 'unknown' });
    });
});

describe('authService.getCurrentUser', () => {
    it('returns the user when authenticated', async () => {
        const user = { id: 2, userName: 'anna' };
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: true, body: user })));

        expect(await authService.getCurrentUser()).toEqual(user);
    });

    it('returns null when not authenticated', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ ok: false, status: 401 })));

        expect(await authService.getCurrentUser()).toBeNull();
    });
});
