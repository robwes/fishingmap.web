import { apiClient } from './apiClient';

const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/species`;

/**
 * Builds the FormData payload for creating/updating a species, including
 * any image files.
 * @param {Object} species - The species form values.
 * @returns {FormData} The multipart payload.
 */
const toSpeciesFormData = (species) => {
    const formData = new FormData();

    if (species.id != null) {
        formData.append("id", species.id);
    }
    formData.append("name", species.name ?? "");
    formData.append("scientificName", species.scientificName ?? "");
    formData.append("description", species.description ?? "");

    species.images?.forEach(image => {
        formData.append("images", image)
    });

    return formData;
}

export const speciesService = {
    getSpecies: async (search) => {
        let requestUrl = baseUrl;
        if (search) {
            const searchParams = new URLSearchParams({ search });
            requestUrl += `?${searchParams}`;
        }

        return await apiClient.getJson(requestUrl, []);
    },

    getSpeciesById: async (id) => {
        return await apiClient.getJson(`${baseUrl}/${id}`);
    },

    createSpecies: async (species) => {
        return await apiClient.sendForm(baseUrl, "POST", toSpeciesFormData(species));
    },

    updateSpecies: async (id, species) => {
        return await apiClient.sendForm(`${baseUrl}/${id}`, "PUT", toSpeciesFormData(species));
    },

    addImageToSpecies: async (id, image) => {
        const formData = new FormData();
        formData.append('image', image);
        return await apiClient.sendForm(`${baseUrl}/${id}/images`, "POST", formData);
    },

    removeImageFromSpecies: async (id, imageId) => {
        return await apiClient.requestOk(`${baseUrl}/${id}/images/${imageId}`, { method: "DELETE" });
    },

    deleteSpecies: async (id) => {
        return await apiClient.requestOk(`${baseUrl}/${id}`, { method: "DELETE" });
    }
};
