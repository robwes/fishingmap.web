import { apiClient } from './apiClient';

const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/regulations`;

/**
 * Builds the JSON body for creating or updating a regulation.
 *
 * Unlike the location/species/permit services this sends JSON, not FormData —
 * `RegulationsController` takes `[FromBody]` and regulations carry no images.
 *
 * Scope is exclusive: the backend rejects a regulation that sets both
 * `regionId` and `locationIds`, and one that sets neither. Whichever side the
 * caller supplies, the other is sent empty rather than left to chance.
 * @param {Object} regulation - The regulation form values.
 * @returns {Object} The request body.
 */
const toRegulationBody = (regulation) => {
    const locationIds = regulation.regionId == null ? (regulation.locationIds ?? []) : [];

    return {
        speciesId: regulation.speciesId,
        regionId: regulation.regionId ?? null,
        locationIds,
        // Null means the rule applies whatever the fin looks like. That is a
        // value, not an omission — sending anything else would narrow the rule
        // to half its species.
        adiposeFin: regulation.adiposeFin ?? null,
        minimumSizeCm: regulation.minimumSizeCm ?? null,
        maximumSizeCm: regulation.maximumSizeCm ?? null,
        bagLimit: regulation.bagLimit ?? null,
        bagLimitBasis: regulation.bagLimitBasis ?? null,
        isCatchAndReleaseOnly: regulation.isCatchAndReleaseOnly ?? false,
        isFullyProtected: regulation.isFullyProtected ?? false,
        mustReportCatch: regulation.mustReportCatch ?? false,
        additionalRules: regulation.additionalRules ?? null,
        protectedPeriods: (regulation.protectedPeriods ?? []).map(period => ({
            startMonth: period.startMonth,
            startDay: period.startDay,
            endMonth: period.endMonth,
            endDay: period.endDay,
        })),
    };
};

export const regulationService = {
    getRegulations: async () => {
        return await apiClient.getJson(baseUrl, []);
    },

    getRegulation: async (id) => {
        return await apiClient.getJson(`${baseUrl}/${id}`);
    },

    /**
     * The resolved rules for one water — one winning rule per species, tagged
     * with the tier it came from. Location details gets these on the location
     * itself; this is for callers that need them without the whole location.
     */
    getRulesForLocation: async (locationId) => {
        return await apiClient.getJson(`${baseUrl}/location/${locationId}`, []);
    },

    /** Every rule for a species, scoped by region or location **name**. */
    getRegulationsForSpecies: async (speciesId) => {
        return await apiClient.getJson(`${baseUrl}/species/${speciesId}`, []);
    },

    createRegulation: async (regulation) => {
        return await apiClient.sendJson(baseUrl, "POST", toRegulationBody(regulation));
    },

    updateRegulation: async (id, regulation) => {
        return await apiClient.sendJson(`${baseUrl}/${id}`, "PUT", { id, ...toRegulationBody(regulation) });
    },

    deleteRegulation: async (id) => {
        return await apiClient.requestOk(`${baseUrl}/${id}`, { method: "DELETE" });
    },

    /**
     * Records whether a water inherits its region's rules for one species.
     *
     * `false` does not remove a rule — it puts the species back to having no decision
     * recorded at this water, which is a different state from following and from having a
     * custom rule. The backend refuses to start following while a location-scoped rule
     * exists, so switch to following by deleting that rule first.
     * @param {number} locationId - The water.
     * @param {number} speciesId - The species being decided.
     * @param {boolean} follows - Whether to inherit.
     * @returns {Promise<boolean>} True when the write succeeded.
     */
    setFollowsRegion: async (locationId, speciesId, follows) => {
        return await apiClient.requestOk(
            `${baseUrl}/location/${locationId}/species/${speciesId}/follows-region`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ follows }),
            }
        );
    },
};
