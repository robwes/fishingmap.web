// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CurrentUserContext } from '@/shared/context/CurrentUserContext';
import ProtectedRoute from './ProtectedRoute';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    cleanup();
});

/**
 * Renders a protected /secret route with the given current user and
 * ProtectedRoute props, alongside a "/" route to observe redirects.
 * @param {Object|null} user - The signed-in user, or null.
 * @param {Object} [props] - Extra props for ProtectedRoute.
 */
const renderRoute = (user, props = {}) => {
    render(
        <CurrentUserContext value={[user, vi.fn(), null]}>
            <MemoryRouter initialEntries={['/secret']}>
                <Routes>
                    <Route path="/" element={<div>home</div>} />
                    <Route
                        path="/secret"
                        element={
                            <ProtectedRoute {...props}>
                                <div>secret</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </CurrentUserContext>
    );
};

describe('ProtectedRoute', () => {
    it('redirects anonymous users to the redirect path', () => {
        renderRoute(null);

        expect(screen.getByText('home')).toBeDefined();
        expect(screen.queryByText('secret')).toBeNull();
    });

    it('renders the route for any signed-in user when no roles are required', () => {
        renderRoute({ id: 1, roles: [] });

        expect(screen.getByText('secret')).toBeDefined();
    });

    it('matches required role names against role objects, not strings', () => {
        renderRoute(
            { id: 1, roles: [{ id: 1, name: 'Administrator' }] },
            { requiredRoles: ['Administrator'] }
        );

        expect(screen.getByText('secret')).toBeDefined();
    });

    it('redirects when no role name matches exactly (Admin is not Administrator)', () => {
        renderRoute(
            { id: 1, roles: [{ id: 1, name: 'Admin' }] },
            { requiredRoles: ['Administrator'] }
        );

        expect(screen.getByText('home')).toBeDefined();
        expect(screen.queryByText('secret')).toBeNull();
    });

    it('redirects a user with no roles array when roles are required', () => {
        renderRoute({ id: 1 }, { requiredRoles: ['Administrator'] });

        expect(screen.getByText('home')).toBeDefined();
    });
});
