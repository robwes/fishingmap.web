import { apiClient } from './apiClient';

const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/locations`;

/**
 * Builds the query string shared by the location list endpoints.
 * @param {string} search - Free-text search term.
 * @param {Array<number>} sIds - Species ids to filter by.
 * @param {number|string} radius - Search radius in km (only sent with an origin).
 * @param {{latitude: number, longitude: number}|null} radiusOrigin - Origin of the radius search.
 * @returns {string} URL-encoded query string (may be empty).
 */
const getSearchQueryString = (search, sIds, radius, radiusOrigin) => {
    const searchParams = new URLSearchParams();

    if (search) {
        searchParams.append("search", search);
    }

    if (sIds.length > 0) {
        sIds.forEach(sId => searchParams.append("sIds", sId));
    }

    if (radiusOrigin) {
        searchParams.append("orgLat", radiusOrigin.latitude);
        searchParams.append("orgLng", radiusOrigin.longitude);

        if (radius) {
            searchParams.append("radius", radius);
        }
    }

    return searchParams.toString();
}

/**
 * Appends the search query string to a list endpoint URL.
 * @param {string} url - The endpoint URL without query string.
 * @param {Array} searchArgs - Arguments forwarded to getSearchQueryString.
 * @returns {string} The URL with query string when there is one.
 */
const withSearchParams = (url, ...searchArgs) => {
    const searchParams = getSearchQueryString(...searchArgs);
    return searchParams ? `${url}?${searchParams}` : url;
}

/**
 * Builds the FormData payload for creating/updating a location, including
 * any image files. Nested arrays/objects are stringified because the
 * backend reads them from multipart form fields.
 * @param {Object} location - The location form values.
 * @returns {FormData} The multipart payload.
 */
const toLocationFormData = (location) => {
    const formData = new FormData();

    formData.append("name", location.name ?? "");
    formData.append("description", location.description ?? "");
    formData.append("species", JSON.stringify(location.species ?? []));
    formData.append("permits", JSON.stringify(location.permits ?? []));

    formData.append("geometry", location.geometry ?? "");
    formData.append("navigationposition", location.navigationPosition ? JSON.stringify(location.navigationPosition) : "");
    formData.append("rules", location.rules ?? "");

    if (location.images) {
        location.images.forEach(image => {
            formData.append("images", image)
        });
    }

    return formData;
}

export const locationService = {
    getLocations: async (search = "", sIds = [], radius = "", radiusOrigin = null) => {
        return await apiClient.getJson(withSearchParams(baseUrl, search, sIds, radius, radiusOrigin), []);
    },

    getLocationMarkers: async (search = "", sIds = [], radius = "", radiusOrigin = null) => {
        return await apiClient.getJson(withSearchParams(`${baseUrl}/markers`, search, sIds, radius, radiusOrigin), []);
    },

    getLocationsSummary: async (search = "", sIds = [], radius = "", radiusOrigin = null) => {
        return await apiClient.getJson(withSearchParams(`${baseUrl}/summary`, search, sIds, radius, radiusOrigin), []);
    },

    getLocation: async (id) => {
        return await apiClient.getJson(`${baseUrl}/${id}`);
    },

    createLocation: async (location) => {
        return await apiClient.sendForm(baseUrl, "POST", toLocationFormData(location));
    },

    updateLocation: async (id, location) => {
        return await apiClient.sendForm(`${baseUrl}/${id}`, "PUT", toLocationFormData(location));
    },

    deleteLocation: async (id) => {
        return await apiClient.requestOk(`${baseUrl}/${id}`, { method: "DELETE" });
    },

    patchLocationInfo: async (id, { name, description, rules }) => {
        return await apiClient.sendJson(`${baseUrl}/${id}/info`, "PATCH", { name, description, rules });
    },

    patchLocationAssociations: async (id, { species, permits }) => {
        return await apiClient.sendJson(`${baseUrl}/${id}/associations`, "PATCH", { species, permits });
    },

    addImageToLocation: async (id, image) => {
        const formData = new FormData();
        formData.append('image', image);
        return await apiClient.sendForm(`${baseUrl}/${id}/images`, "POST", formData);
    },

    removeImageFromLocation: async (id, imageId) => {
        return await apiClient.requestOk(`${baseUrl}/${id}/images/${imageId}`, { method: "DELETE" });
    },

    patchLocationGeometry: async (id, { geometry, navigationPosition }) => {
        return await apiClient.sendJson(`${baseUrl}/${id}/geometry`, "PATCH", { geometry, navigationPosition });
    },
};
