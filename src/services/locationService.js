const baseUrl = `${process.env.REACT_APP_BASE_URL}/api/locations`;

export const locationService = {
    getLocations: async (search = "", sIds = [], radius = "", radiusOrigin = null) => {
        try {

            let requestUrl = baseUrl;
            if (search || sIds.length > 0 || radius) {
                const searchParams = new URLSearchParams();

                if (search) {
                    searchParams.append("search", search);
                }

                if (sIds.length > 0) {
                    sIds.forEach(sId => searchParams.append("sIds", sId));
                }

                if (radius && radiusOrigin) {
                    searchParams.append("orgLat", radiusOrigin.latitude);
                    searchParams.append("orgLng", radiusOrigin.longitude);
                    searchParams.append("radius", radius);
                }

                requestUrl += `?${searchParams}`;
            }

            const response = await fetch(requestUrl);
            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return [];
    },

    getLocation: async (id) => {
        try {
            const response = await fetch(`${baseUrl}/${id}`);
            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    createLocation: async (location) => {
        try {
            const formData = new FormData();
            
            formData.append("name", location.name ?? "");
            formData.append("description", location.description ?? "");
            formData.append("species", JSON.stringify(location.species ?? []));
            formData.append("permits", JSON.stringify(location.permits ?? []));

            formData.append("geometry", location.geometry ?? "");
            formData.append("rules", location.rules ?? "");

            if (location.images) {
                location.images.forEach(image => {
                    formData.append("images", image)
                });
            }

            const response = await fetch(baseUrl, {
                method: "POST",
                credentials: 'include',
                body: formData
            });
            
            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    updateLocation: async (id, location) => {
        try {
            const formData = new FormData();
            
            formData.append("name", location.name ?? "");
            formData.append("description", location.description ?? "");
            formData.append("species", JSON.stringify(location.species ?? []));
            formData.append("permits", JSON.stringify(location.permits ?? []));

            formData.append("geometry", location.geometry ?? "");
            formData.append("rules", location.rules ?? "");

            if (location.images) {
                location.images.forEach(image => {
                    formData.append("images", image)
                });
            }

            const response = await fetch(`${baseUrl}/${id}`, {
                method: "PUT",
                credentials: 'include',
                body: formData
            });

            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    deleteLocation: async (id) => {
        try {
            await fetch(`${baseUrl}/${id}`, {
                method: "DELETE",
                credentials: 'include'
            });

            return true;
        } catch (e) {
            console.log(e);
        }

        return false;
    }
};