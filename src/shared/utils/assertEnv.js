/**
 * Startup guard for required environment variables. Missing VITE_ values
 * used to fail silently at runtime (services swallow errors and return
 * sentinels), which made a broken .env file very hard to diagnose — so the
 * app now refuses to boot without them.
 */

/**
 * Returns the names of variables whose value is missing or empty.
 * Pure — exported for testing.
 * @param {Object} envValues - Map of variable name to its value.
 * @returns {Array<string>} Names of missing variables.
 */
export const findMissingEnvVars = (envValues) => {
    return Object.entries(envValues)
        .filter(([, value]) => !value)
        .map(([name]) => name);
};

/**
 * Verifies the four required VITE_ variables, rendering a readable error
 * into #root and throwing when any are missing. Values are referenced
 * statically because Vite replaces `import.meta.env.VITE_*` at build time.
 */
export const assertRequiredEnv = () => {
    const missing = findMissingEnvVars({
        VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
        VITE_IMAGES_URL: import.meta.env.VITE_IMAGES_URL,
        VITE_MAPS_API_KEY: import.meta.env.VITE_MAPS_API_KEY,
        VITE_MAP_ID: import.meta.env.VITE_MAP_ID,
    });

    if (missing.length > 0) {
        const message = `Missing required environment variables: ${missing.join(', ')}. `
            + 'Set them in .env.development.local (dev) or .env.production (build) and restart.';

        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = '';
            const pre = document.createElement('pre');
            pre.style.cssText = 'margin: 2em; padding: 1em; background: #fee; color: #900; white-space: pre-wrap; font-size: 14px;';
            pre.textContent = message;
            root.appendChild(pre);
        }

        throw new Error(message);
    }
};
