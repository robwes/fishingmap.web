function useLocation() {

    function getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    resolve({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
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

export default useLocation;
