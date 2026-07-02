/**
 * Shared fetch helpers for the API services.
 *
 * All helpers follow the same convention the services expose to their
 * callers: any failure — network error or non-2xx response — is logged to
 * the console and swallowed, and a sentinel value (the given fallback, or
 * `false` for requestOk) is returned instead. Callers branch on the
 * sentinel, never try/catch.
 *
 * `fetch` itself only rejects on network errors, so every helper checks
 * `response.ok` to make sure an HTTP error (401/403/500...) is never
 * mistaken for a success.
 */

/**
 * Performs a fetch and parses the JSON response body. Throws when the
 * response status is not 2xx.
 * @param {string} url - The absolute URL to request.
 * @param {RequestInit} [options] - Options passed through to fetch.
 * @returns {Promise<any>} The parsed JSON body.
 */
const requestJson = async (url, options) => {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`${options?.method ?? 'GET'} ${url} failed with status ${response.status}`);
    }

    return await response.json();
};

export const apiClient = {

    /**
     * GETs a URL and returns the parsed JSON body.
     * @param {string} url - The absolute URL to request.
     * @param {any} [fallback] - Sentinel returned on failure (default null).
     * @param {RequestInit} [options] - Extra fetch options (e.g. credentials).
     * @returns {Promise<any>} The parsed JSON body, or the fallback.
     */
    getJson: async (url, fallback = null, options = undefined) => {
        try {
            return await requestJson(url, options);
        } catch (e) {
            console.log(e);
        }

        return fallback;
    },

    /**
     * Sends a JSON body with credentials and returns the parsed JSON response.
     * @param {string} url - The absolute URL to request.
     * @param {string} method - HTTP method (POST/PUT/PATCH).
     * @param {Object} body - Object serialized as the JSON request body.
     * @param {any} [fallback] - Sentinel returned on failure (default null).
     * @returns {Promise<any>} The parsed JSON body, or the fallback.
     */
    sendJson: async (url, method, body, fallback = null) => {
        try {
            return await requestJson(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (e) {
            console.log(e);
        }

        return fallback;
    },

    /**
     * Sends a FormData body with credentials and returns the parsed JSON response.
     * @param {string} url - The absolute URL to request.
     * @param {string} method - HTTP method (POST/PUT/PATCH).
     * @param {FormData} formData - The form data request body.
     * @param {any} [fallback] - Sentinel returned on failure (default null).
     * @returns {Promise<any>} The parsed JSON body, or the fallback.
     */
    sendForm: async (url, method, formData, fallback = null) => {
        try {
            return await requestJson(url, {
                method,
                credentials: 'include',
                body: formData
            });
        } catch (e) {
            console.log(e);
        }

        return fallback;
    },

    /**
     * Performs a request and returns the outcome without collapsing it into
     * a sentinel, for callers that need to tell an HTTP rejection apart from
     * an unreachable backend (status 0). Never throws.
     * @param {string} url - The absolute URL to request.
     * @param {RequestInit} [options] - Options passed through to fetch.
     * @returns {Promise<{ok: boolean, status: number, body: any}>} Outcome
     *   with the parsed JSON body on success, null body otherwise, and
     *   status 0 on network errors.
     */
    requestResult: async (url, options = undefined) => {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return { ok: true, status: response.status, body: await response.json() };
            }
            return { ok: false, status: response.status, body: null };
        } catch (e) {
            console.log(e);
        }

        return { ok: false, status: 0, body: null };
    },

    /**
     * Performs a request where only success/failure matters (deletes, login,
     * password change). Sends credentials by default.
     * @param {string} url - The absolute URL to request.
     * @param {RequestInit} [options] - Fetch options (method, headers, body).
     * @returns {Promise<boolean>} True when the response status is 2xx.
     */
    requestOk: async (url, options = {}) => {
        try {
            const response = await fetch(url, { credentials: 'include', ...options });
            if (!response.ok) {
                console.log(`${options.method ?? 'GET'} ${url} failed with status ${response.status}`);
            }
            return response.ok;
        } catch (e) {
            console.log(e);
        }

        return false;
    }
};
