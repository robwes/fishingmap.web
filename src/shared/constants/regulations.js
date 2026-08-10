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
    // Root, not National: the top of the hierarchy needn't be a country. The
    // rule *source* label still reads "National" — see RULE_SOURCE below; that
    // is a display string, not this tier's name.
    ROOT: 'Root',
    ELY: 'Ely',
    MANAGEMENT_AREA: 'ManagementArea',
};

export const REGION_TYPE_LABELS = {
    [REGION_TYPE.ROOT]: 'National',
    [REGION_TYPE.ELY]: 'ELY region',
    [REGION_TYPE.MANAGEMENT_AREA]: 'Management area',
};

/**
 * The tier a new child region gets, one step below its parent.
 *
 * A lookup rather than arithmetic: `type` is the enum's name now, so
 * `parent.type + 1` is meaningless. A management area has nothing below it,
 * which is why it is absent rather than mapped to itself — callers use that
 * to hide the "add a region under this" affordance.
 */
export const REGION_CHILD_TYPE = {
    [REGION_TYPE.ROOT]: REGION_TYPE.ELY,
    [REGION_TYPE.ELY]: REGION_TYPE.MANAGEMENT_AREA,
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

/**
 * Which fish a rule covers, when it distinguishes them by adipose fin. Wild
 * trout and salmon keep the fin; hatchery fish are clipped before release, and
 * the decree treats the two as different fish — in Uusimaa an intact-finned
 * trout is fully protected while a clipped one may be kept at 50 cm.
 *
 * A rule's `adiposeFin` is **null** when it doesn't care about the fin, which
 * is every rule written before variants existed. Null is a real value here, not
 * a missing one: it means "all of them", so it must never be defaulted away.
 *
 * Keep in sync with `AdiposeFin.cs`, which serializes by name as `RegionType`
 * and `BagLimitBasis` do.
 */
export const ADIPOSE_FIN = {
    INTACT: 'Intact',
    CLIPPED: 'Clipped',
};

export const ADIPOSE_FIN_LABELS = {
    [ADIPOSE_FIN.INTACT]: 'Adipose fin intact',
    [ADIPOSE_FIN.CLIPPED]: 'Adipose fin clipped',
};

/** What the fin state means in practice, for anyone who doesn't know the term. */
export const ADIPOSE_FIN_HINTS = {
    [ADIPOSE_FIN.INTACT]: 'wild fish',
    [ADIPOSE_FIN.CLIPPED]: 'hatchery-reared',
};

/**
 * What a bag limit is counted against. Deliberately not a duration — put-and-take
 * waters sell a permit covering a fixed number of fish, so `Permit` sits alongside
 * the time-based values. Keep in sync with `BagLimitBasis.cs`, which serializes by
 * name for the same reason `RegionType` does.
 *
 * A rule may carry a `bagLimit` with no basis: the source regulation didn't say.
 * That renders as a bare count — never assume "per day".
 */
export const BAG_LIMIT_BASIS = {
    DAY: 'Day',
    WEEK: 'Week',
    SEASON: 'Season',
    YEAR: 'Year',
    PERMIT: 'Permit',
};

/**
 * Short month names, indexed 0-11. Protected periods carry a month number and
 * no year, so both the formatters and the period editor's month pickers read
 * from this one list.
 */
export const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Days per month, indexed 0-11, used to keep a protected period from naming a
 * day its month doesn't have.
 *
 * February is 29, not 28. Periods carry no year, so a closure ending "end of
 * February" is a real rule that has to be expressible; and because periods are
 * compared as month/day ordinals, an end of 29 Feb still behaves correctly in
 * a non-leap year.
 */
export const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const BAG_LIMIT_BASIS_LABELS = {
    [BAG_LIMIT_BASIS.DAY]: 'per day',
    [BAG_LIMIT_BASIS.WEEK]: 'per week',
    [BAG_LIMIT_BASIS.SEASON]: 'per season',
    [BAG_LIMIT_BASIS.YEAR]: 'per year',
    [BAG_LIMIT_BASIS.PERMIT]: 'per permit',
};
