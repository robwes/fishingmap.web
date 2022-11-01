const baseUrl = `https://localhost:7299`;

export const authService = {

    /**
     * 
     * @param {string} username 
     * @param {string} password 
     * @returns {boolean}
     */
    login: async (username, password) => {
        try {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: "POST",
                credentials: 'include',
                headers: { 'Content-Type': ' application/json' },
                body: JSON.stringify({ username: username, password: password })
            });

            return response.ok;
        } catch (e) {
            console.log(e);
        }

        return false;
    },

    getCurrentUser: async () => {
        try {
            const response = await fetch(`${baseUrl}/api/auth/whoami`, {
                credentials: 'include'
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    /**
     * 
     * @returns {boolean}
     */
    logout: async () => {
        try {
            const response = await fetch(`${baseUrl}/api/auth/logout`, {
                method: "POST",
                credentials: "include"
            });

            return response.ok;

        } catch (e) {
            console.log(e);
        }

        return false;
    }
}

export default authService