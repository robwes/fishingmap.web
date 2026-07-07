import React from 'react';
import { useEffect, useState } from 'react';
import useGeolocation from '@/shared/hooks/useGeolocation';
import authService from '@/services/authService';

export const CurrentUserContext = React.createContext();

/**
 * Reads and parses the user mirrored to sessionStorage. A corrupted value
 * must not crash the provider (it gates the whole app), so parse failures
 * are logged, the bad entry is removed, and null is returned.
 * @returns {Object|null} The stored user, or null.
 */
const readStoredUser = () => {
    try {
        const userStr = sessionStorage.getItem("currentUser");
        if (userStr) {
            return JSON.parse(userStr);
        }
    } catch (e) {
        console.log(e);
        sessionStorage.removeItem("currentUser");
    }

    return null;
}

export const CurrentUserProvider = ({children}) => {

    const [currentUser, setCurrentUser] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [getLocation] = useGeolocation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const userLocation = await getLocation();
                if (userLocation) {
                    setCurrentLocation(userLocation);
                }
            } catch (e) {
                console.error(e);
            }

        })();
        // eslint-disable-next-line
    }, [])

    /**
     * Sets the current user in state and mirrors it to sessionStorage
     * (pass null to sign out locally).
     * @param {Object|null} user - The user to store, or null to clear.
     */
    const updateCurrentUser = (user) => {
        if (user) {
            sessionStorage.setItem("currentUser", JSON.stringify(user));
        } else {
            sessionStorage.removeItem("currentUser");
        }
        setCurrentUser(user);
    }

    // Restore the session optimistically from sessionStorage so the UI
    // renders without waiting on the network, then re-validate against the
    // backend: the auth cookie may have expired since the user was stored
    // (stale "logged in" UI), or a valid cookie may exist without a stored
    // user (sessionStorage is per-tab, so new tabs start empty).
    useEffect(() => {
        const storedUser = readStoredUser();
        if (storedUser) {
            setCurrentUser(storedUser);
        }
        setIsReady(true);

        (async () => {
            const session = await authService.getSession();
            if (session.status === 'authenticated') {
                updateCurrentUser(session.user);
            }
            else if (session.status === 'unauthenticated' && storedUser) {
                updateCurrentUser(null);
            }
            // 'unknown' (backend unreachable): keep the optimistic stored
            // user rather than signing out over a network blip.
        })();
    }, [])

    return (
        <CurrentUserContext value={[currentUser, updateCurrentUser, currentLocation]}>
            {isReady ? children : null}
        </CurrentUserContext>
    )
}

export const useCurrentUser = () => React.useContext(CurrentUserContext)
