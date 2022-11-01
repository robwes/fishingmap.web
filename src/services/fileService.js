const baseUrl = `https://localhost:7299`;

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