/**
 * Formats a distance in kilometers for display: one decimal below 10 km,
 * whole numbers above (a fishing spot 42.6 km away doesn't need the decimal).
 * @param {number} km - Distance in kilometers.
 * @returns {string} e.g. "4.2 km" or "43 km".
 */
export const formatKm = (km) => {
    const value = km < 10 ? km.toFixed(1) : Math.round(km);
    return `${value} km`;
};
