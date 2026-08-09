/**
 * Shared vocabulary for the regions & regulations feature.
 *
 * `region.type` arrives as the enum's **name**, not its number — `RegionType`
 * carries a `[JsonConverter(typeof(JsonStringEnumConverter<RegionType>))]`
 * attribute in fishingmap.server, and `RegionTypeSerializationTests` locks
 * that contract. These values are the C# member names verbatim; the labels
 * below are the display strings, which deliberately differ.
 */
export const REGION_TYPE = {
    NATIONAL: 'National',
    ELY: 'Ely',
    MANAGEMENT_AREA: 'ManagementArea',
};

export const REGION_TYPE_LABELS = {
    [REGION_TYPE.NATIONAL]: 'National',
    [REGION_TYPE.ELY]: 'ELY region',
    [REGION_TYPE.MANAGEMENT_AREA]: 'Management area',
};

/**
 * The `source` string on a resolved rule (`location.speciesRules[].source`),
 * which is the only signal telling us whether a rule was inherited or set on
 * the water itself. Region-scoped rules arrive as `"Region: <name>"`, so they
 * are matched by prefix rather than by an exact value.
 *
 * `Unknown` is the backend's fallback when a rule has neither a matching
 * location nor a region — it shouldn't happen, but RegulationsService can
 * emit it, so the UI has to survive it.
 */
export const RULE_SOURCE = {
    LOCATION: 'Location',
    NATIONAL: 'National',
    UNKNOWN: 'Unknown',
};

export const RULE_SOURCE_REGION_PREFIX = 'Region: ';
