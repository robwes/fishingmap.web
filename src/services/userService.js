const endpointUrl = `${process.env.REACT_APP_BASE_URL}/api/users`;

const userService = {

    updateUserDetails: async (userId, userDetails) => {
        try {
            const { firstName, lastName, email } = userDetails;

            const formData = new FormData();
            formData.append("firstname", firstName ?? "");
            formData.append("lastname", lastName ?? "");
            formData.append("email", email ?? "");

            const response = await fetch(`${endpointUrl}/${userId}/details`,
                {
                    method: "PUT",
                    credentials: 'include',
                    body: formData
                });

            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    updateUserPassword: async (userId, userPasswordUpdate) => {
        try {
            const { currentPassword, newPassword } = userPasswordUpdate;
            const formData = new FormData();

            formData.append("currentPassword", currentPassword ?? "");
            formData.append("newPassword", newPassword ?? "");

            const response = await fetch(`${endpointUrl}/${userId}/password`,
                {
                    method: "PUT",
                    credentials: 'include',
                    body: formData
                });

            return response.ok;
        } catch (e) {
            console.log(e);
        }

        return false;
    }
}

export default userService