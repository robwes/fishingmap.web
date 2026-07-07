import { apiClient } from '@/shared/services/apiClient';

const baseUrl = import.meta.env.VITE_BASE_URL;

const authService = {

    /**
     * Attempts to log in with the given credentials. The session is
     * established through an auth cookie set by the backend.
     * @param {string} username
     * @param {string} password
     * @returns {Promise<boolean>} True when the login succeeded.
     */
    login: async (username, password) => {
        return await apiClient.requestOk(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    },

    /**
     * Checks whether the auth cookie still identifies a logged-in user.
     * Distinguishes "the backend rejected the session" from "the backend
     * couldn't be reached", so callers can avoid signing the user out over
     * a network blip.
     * @returns {Promise<{status: 'authenticated', user: Object}
     *   | {status: 'unauthenticated'}
     *   | {status: 'unknown'}>} The session state.
     */
    getSession: async () => {
        const result = await apiClient.requestResult(`${baseUrl}/api/auth/whoami`, {
            credentials: 'include'
        });

        if (result.ok) {
            return { status: 'authenticated', user: result.body };
        }

        if (result.status === 401 || result.status === 403) {
            return { status: 'unauthenticated' };
        }

        return { status: 'unknown' };
    },

    /**
     * Fetches the currently authenticated user from the backend.
     * @returns {Promise<Object|null>} The user, or null when not logged in
     * (or the backend could not be reached).
     */
    getCurrentUser: async () => {
        const session = await authService.getSession();
        return session.status === 'authenticated' ? session.user : null;
    },

    /**
     * Logs out the current user by clearing the auth cookie on the backend.
     * @returns {Promise<boolean>} True when the logout succeeded.
     */
    logout: async () => {
        return await apiClient.requestOk(`${baseUrl}/api/auth/logout`, {
            method: "POST"
        });
    }
}

export default authService
