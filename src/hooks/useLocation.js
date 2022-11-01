function useLocation() {

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
                }
            )
        });
    }

    return [getLocation];
}

export default useLocation;
