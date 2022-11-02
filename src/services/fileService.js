const baseUrl = process.env.REACT_APP_BASE_URL;

export const fileService = {
    getImage: async (url, filename) => {
        try {
            const response = await fetch(`${baseUrl}/${url}`);
            const content = await response.blob();
            return new File([content], filename);
        } catch (e) {
            console.log(e);
        }

        return null;
    }
}