import { apiClient } from '@/shared/services/apiClient';

const endpointUrl = `${import.meta.env.VITE_BASE_URL}/api/users`;

const userService = {

    updateUserDetails: async (userId, userDetails) => {
        const { firstName, lastName, email } = userDetails;

        const formData = new FormData();
        formData.append("firstname", firstName ?? "");
        formData.append("lastname", lastName ?? "");
        formData.append("email", email ?? "");

        return await apiClient.sendForm(`${endpointUrl}/${userId}/details`, "PUT", formData);
    },

    updateUserPassword: async (userId, userPasswordUpdate) => {
        const { currentPassword, newPassword } = userPasswordUpdate;

        const formData = new FormData();
        formData.append("currentPassword", currentPassword ?? "");
        formData.append("newPassword", newPassword ?? "");

        return await apiClient.requestOk(`${endpointUrl}/${userId}/password`, {
            method: "PUT",
            body: formData
        });
    }
}

export default userService
