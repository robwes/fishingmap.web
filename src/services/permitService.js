const baseUrl = `${process.env.REACT_APP_BASE_URL}/api/permits`;

export const permitService = {
    getPermits: async (search) => {
        try {
            let requestUrl = baseUrl;
            if (search) {
                const searchParams = new URLSearchParams({search});
                requestUrl += `?${searchParams}`;
            }

            const response = await fetch(requestUrl, { mode: 'cors' });
            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return [];
    },

    getPermitById: async (id) => {
        try {
            const response = await fetch(`${baseUrl}/${id}`);
            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    createPermit: async (permit) => {
        try {
            const formData = new FormData();
            
            formData.append("name", permit.name ?? "");
            formData.append("url", permit.url ?? "");

            const response = await fetch(baseUrl,
                {
                    method: "POST",
                    credentials: 'include',
                    body: formData
                });
            return await response.json();
        }
        catch (e) {
            console.log(e);
        }

        return null;
    },

    updatePermit: async (id, permit) => {
        try {
            const formData = new FormData();
            
            formData.append("id", permit.id ?? "");
            formData.append("name", permit.name ?? "");
            formData.append("url", permit.url ?? "");

            const response = await fetch(`${baseUrl}/${id}`,
                {
                    method: "PUT",
                    credentials: 'include',
                    body: formData
                });
            return await response.json();
        }
        catch (e) {
            console.log(e);
        }

        return null;
    },

    deletePermit: async (id) => {
        try {
            await fetch(`${baseUrl}/${id}`,{ 
                method: "DELETE",
                credentials: 'include' 
            });
            return true;
        } catch (e) {
            console.log(e);
        }

        return false;
    }
}