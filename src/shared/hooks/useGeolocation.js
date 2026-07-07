/**
 * Wraps the browser geolocation API in a promise. Named useGeolocation —
 * not useLocation — to avoid shadowing react-router-dom's useLocation.
 */
function useGeolocation() {

    /**
     * Resolves the device's current position, rejecting on denial/timeout.
     * @returns {Promise<{latitude: number, longitude: number}>}
     */
    function getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    resolve({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {maximumAge:0, timeout:5000, enableHighAccuracy: true}
            )
        });
    }

    return [getLocation];
}

export default useGeolocation;
