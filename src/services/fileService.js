const imagesUrl = import.meta.env.VITE_IMAGES_URL;

export const fileService = {
    /**
     * Builds the public URL for an image served by the backend images
     * endpoint. Use this for plain <img src> rendering — only use getImage
     * when an actual File object is needed (e.g. re-uploading).
     * @param {string} path - The image path as stored on the entity.
     * @returns {string} The absolute image URL.
     */
    getImageUrl: (path) => `${imagesUrl}/${path}`,

    getImage: async (url, filename) => {
        try {
            const response = await fetch(`${imagesUrl}/${url}`);

            if (!response.ok) {
                throw new Error(`GET ${imagesUrl}/${url} failed with status ${response.status}`);
            }

            const content = await response.blob();
            return new File([content], filename);
        } catch (e) {
            console.log(e);
        }

        return null;
    }
}
