import React from 'react';
import { useEffect, useState } from 'react';
import useLocation from '../hooks/useLocation';

export const CurrentUserContext = React.createContext();

export const CurrentUserProvider = ({children}) => {

    const [currentUser, setCurrentUser] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [getLocation] = useLocation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            const userLocation = await getLocation();
            if (userLocation) {
                setCurrentLocation(userLocation);
            }
        })();
    }, [])

    useEffect(() => {
        const userStr = sessionStorage.getItem("currentUser");
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
        setIsReady(true);
    }, [])

    const updateCurrentUser = (user) => {
        if (user) {
            sessionStorage.setItem("currentUser", JSON.stringify(user));
        } else {
            sessionStorage.removeItem("currentUser");
        }
        setCurrentUser(user);
    }

    return (
        <CurrentUserContext.Provider value={[currentUser, updateCurrentUser, currentLocation]}>
            {isReady ? children : null}
        </CurrentUserContext.Provider>
    )
}

export const useCurrentUser = () => React.useContext(CurrentUserContext)
