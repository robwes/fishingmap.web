import { apiClient } from './apiClient';

const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/permits`;

/**
 * Builds the FormData payload for creating/updating a permit.
 * @param {Object} permit - The permit form values.
 * @returns {FormData} The multipart payload.
 */
const toPermitFormData = (permit) => {
    const formData = new FormData();

    if (permit.id != null) {
        formData.append("id", permit.id);
    }
    formData.append("name", permit.name ?? "");
    formData.append("url", permit.url ?? "");

    return formData;
}

export const permitService = {
    getPermits: async (search) => {
        let requestUrl = baseUrl;
        if (search) {
            const searchParams = new URLSearchParams({ search });
            requestUrl += `?${searchParams}`;
        }

        return await apiClient.getJson(requestUrl, []);
    },

    getPermitById: async (id) => {
        return await apiClient.getJson(`${baseUrl}/${id}`);
    },

    createPermit: async (permit) => {
        return await apiClient.sendForm(baseUrl, "POST", toPermitFormData(permit));
    },

    updatePermit: async (id, permit) => {
        return await apiClient.sendForm(`${baseUrl}/${id}`, "PUT", toPermitFormData(permit));
    },

    deletePermit: async (id) => {
        return await apiClient.requestOk(`${baseUrl}/${id}`, { method: "DELETE" });
    }
}
