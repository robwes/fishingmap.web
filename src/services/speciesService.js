const baseUrl = `${process.env.REACT_APP_BASE_URL}/api/species`;

export const speciesService = {
    getSpecies: async (search) => {
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

    getSpeciesById: async (id) => {
        try {
            const response = await fetch(`${baseUrl}/${id}`);
            return await response.json();
        } catch (e) {
            console.log(e);
        }

        return null;
    },

    createSpecies: async (species) => {
        try {
            const formData = new FormData();
            
            formData.append("name", species.name ?? "");
            formData.append("description", species.description ?? "");

            species.images?.forEach(image => {
                formData.append("images", image)
            });

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

    updateSpecies: async (id, species) => {
        try {
            const formData = new FormData();
            
            formData.append("id", species.id ?? "");
            formData.append("name", species.name ?? "");
            formData.append("description", species.description ?? "");

            species.images.forEach(image => {
                formData.append("images", image)
            });

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

    deleteSpecies: async (id) => {
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
};
