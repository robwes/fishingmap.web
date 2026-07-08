// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { CurrentUserProvider, useCurrentUser } from './CurrentUserContext';
import authService from '@/features/auth/authService';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/features/auth/authService', () => ({
    default: { getSession: vi.fn() }
}));

// The provider kicks off a geolocation lookup on mount; keep it inert here.
vi.mock('@/shared/hooks/useGeolocation', () => ({
    default: () => [async () => null]
}));

/** Renders the current user's name (or 'anonymous') via the context. */
const ShowUser = () => {
    const [currentUser] = useCurrentUser();
    return <div>{currentUser ? currentUser.username : 'anonymous'}</div>;
};

/** Renders ShowUser inside the provider and flushes the session check. */
const renderProvider = async () => {
    render(
        <CurrentUserProvider>
            <ShowUser />
        </CurrentUserProvider>
    );
    await act(async () => {});
};

beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
});

afterEach(() => {
    cleanup();
});

describe('CurrentUserProvider session revalidation', () => {
    it('signs in and mirrors the user to sessionStorage when the session is authenticated', async () => {
        authService.getSession.mockResolvedValue({
            status: 'authenticated',
            user: { id: 1, username: 'rob' }
        });

        await renderProvider();

        expect(screen.getByText('rob')).toBeDefined();
        expect(JSON.parse(sessionStorage.getItem('currentUser'))).toEqual({ id: 1, username: 'rob' });
    });

    it('signs out a stored user when the backend says unauthenticated', async () => {
        sessionStorage.setItem('currentUser', JSON.stringify({ id: 1, username: 'rob' }));
        authService.getSession.mockResolvedValue({ status: 'unauthenticated', user: null });

        await renderProvider();

        expect(screen.getByText('anonymous')).toBeDefined();
        expect(sessionStorage.getItem('currentUser')).toBeNull();
    });

    it('keeps the stored user when the backend is unreachable (unknown)', async () => {
        sessionStorage.setItem('currentUser', JSON.stringify({ id: 1, username: 'rob' }));
        authService.getSession.mockResolvedValue({ status: 'unknown', user: null });

        await renderProvider();

        expect(screen.getByText('rob')).toBeDefined();
        expect(sessionStorage.getItem('currentUser')).not.toBeNull();
    });

    it('recovers from corrupted sessionStorage instead of crashing the app', async () => {
        sessionStorage.setItem('currentUser', '{not valid json');
        authService.getSession.mockResolvedValue({ status: 'unknown', user: null });
        vi.spyOn(console, 'log').mockImplementation(() => {});

        await renderProvider();

        expect(screen.getByText('anonymous')).toBeDefined();
        expect(sessionStorage.getItem('currentUser')).toBeNull();
    });
});
