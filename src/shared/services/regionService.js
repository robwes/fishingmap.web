import { apiClient } from './apiClient';

const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/regions`;

/**
 * Builds the JSON body for creating or updating a region. JSON rather than
 * FormData for the same reason as `regulationService` — `RegionsController`
 * takes `[FromBody]`.
 * @param {Object} region - The region form values.
 * @returns {Object} The request body.
 */
const toRegionBody = (region) => ({
    name: region.name ?? "",
    // The enum NAME, not a number — RegionType serializes by name.
    type: region.type,
    parentRegionId: region.parentRegionId ?? null,
});

export const regionService = {
    getRegions: async () => {
        return await apiClient.getJson(baseUrl, []);
    },

    getRegion: async (id) => {
        return await apiClient.getJson(`${baseUrl}/${id}`);
    },

    createRegion: async (region) => {
        return await apiClient.sendJson(baseUrl, "POST", toRegionBody(region));
    },

    updateRegion: async (id, region) => {
        return await apiClient.sendJson(`${baseUrl}/${id}`, "PUT", { id, ...toRegionBody(region) });
    },

    deleteRegion: async (id) => {
        return await apiClient.requestOk(`${baseUrl}/${id}`, { method: "DELETE" });
    },
};
