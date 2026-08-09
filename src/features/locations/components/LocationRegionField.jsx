import React from 'react';
import Select from '@/shared/components/form/Select';
import RegionChainNote from './RegionChainNote';
import { REGION_TYPE } from '@/shared/constants/regulations';
import {
    buildRegionChain,
    getRegionChangeImpact,
    getRuleSourceKind,
} from '@/shared/utils/regulationUtils';
import './LocationRegionField.scss';

// Tier order for grouping, most general first.
const REGION_TIERS = [
    { type: REGION_TYPE.NATIONAL, label: 'National' },
    { type: REGION_TYPE.ELY, label: 'ELY regions' },
    { type: REGION_TYPE.MANAGEMENT_AREA, label: 'Management areas' },
];

/**
 * Groups regions by tier for the picker.
 *
 * Grouped rather than indented: a native select renders the chosen option's
 * raw text when collapsed, so padding option labels to fake a tree leaks the
 * indent into the closed control. The selected region's ancestry comes from
 * the chain note underneath instead.
 * @param {Array<Object>} regions - Every region.
 * @returns {Array<{type: string, label: string, rows: Array<Object>}>} Non-empty tiers.
 */
const groupRegionsByTier = (regions) => REGION_TIERS
    .map(({ type, label }) => ({
        type,
        label,
        rows: regions.filter(r => r.type === type).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter(group => group.rows.length > 0);

/**
 * Picks the region a water belongs to.
 *
 * The region is what the water's rules cascade from, so changing it rewrites
 * everything it inherits. That is the whole reason this field carries an
 * impact list: the change is invisible in its consequences otherwise, and it
 * is exactly the blast radius the editing split was designed to avoid.
 * @param {Object} location - The location being edited.
 * @param {Array<Object>} regions - Every region.
 * @param {Array<Object>} regulations - Every regulation, for the impact list.
 * @param {number|null} value - The currently selected region id.
 */
function LocationRegionField({ location, regions, regulations, value }) {
    const selectedChain = buildRegionChain(regions, value);
    const originalChain = buildRegionChain(regions, location.region?.id);
    const hasChanged = (location.region?.id ?? null) !== (value ?? null);

    // A rule set on the water itself wins wherever the water sits.
    const overriddenSpeciesIds = (location.speciesRules ?? [])
        .filter(rule => getRuleSourceKind(rule.source) === 'location')
        .map(rule => rule.speciesId);

    const impact = hasChanged
        ? getRegionChangeImpact({
            species: location.species ?? [],
            regulations,
            fromChain: originalChain,
            toChain: selectedChain,
            overriddenSpeciesIds,
        })
        : [];

    return (
        <div className="location-region-field">
            <Select label="Region" name="regionId">
                <option value="">Not part of a region</option>
                {groupRegionsByTier(regions).map(group => (
                    <optgroup key={group.type} label={group.label}>
                        {group.rows.map(region => (
                            <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                    </optgroup>
                ))}
            </Select>

            <RegionChainNote regions={selectedChain} />

            {hasChanged && impact.length > 0 && (
                <div className="region-impact">
                    <p className="region-impact-head">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        Saving this changes {impact.length} species{' '}
                        {impact.length === 1 ? 'rule' : 'rules'} at this water.
                    </p>
                    <ul className="region-impact-list">
                        {impact.map(entry => (
                            <li key={entry.id}>
                                <span className="region-impact-species">
                                    <i className="fa-solid fa-fish"></i>{entry.name}
                                </span>
                                <span className="region-impact-from">{entry.from ?? 'no rule'}</span>
                                <i className="fa-solid fa-arrow-right region-impact-arrow"></i>
                                <span className="region-impact-to">{entry.to ?? 'no rule'}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="region-impact-note">
                        Rules set specifically for this water are not affected.
                    </p>
                </div>
            )}

            {hasChanged && impact.length === 0 && (
                <p className="region-impact-none">
                    <i className="fa-solid fa-circle-check"></i>
                    No species rules change at this water.
                </p>
            )}
        </div>
    )
}

export default LocationRegionField;
