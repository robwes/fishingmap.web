import React from 'react';
import { getRegionTypeLabel } from '@/shared/utils/regulationUtils';
import './RegionChainNote.scss';

/**
 * Where this water sits in the region hierarchy, shown once under the species
 * list rather than repeated on every row.
 *
 * Takes the chain root-first (Finland → Uusimaa → Espoo lakes). Location
 * details can currently only pass the water's own region: `location.region` is
 * a single object carrying `parentRegionId` but not the parent itself, so the
 * ancestors aren't available without fetching every region. Passing one region
 * renders one step, which is honest — see issue #13.
 * @param {Array<Object>} regions - Region chain, root first. Empty or absent when the water has no region.
 */
function RegionChainNote({ regions }) {
    const chain = regions?.filter(Boolean) ?? [];

    if (chain.length === 0) {
        return (
            <p className="region-chain is-empty">
                <i className="fa-solid fa-circle-info"></i>
                Not part of a region — it can only inherit the national rules.
            </p>
        )
    }

    return (
        <p className="region-chain">
            <i className="fa-solid fa-sitemap"></i>
            {/* "Can inherit", not "inherits": inheritance is opt-in per species, so a chain
                here says what is available to follow, not what this water has taken. */}
            <span className="region-chain-label">Can inherit from</span>
            {chain.map((region, index) => (
                <span key={region.id} className="region-chain-step">
                    {index > 0 && <i className="fa-solid fa-chevron-right region-chain-sep"></i>}
                    <span title={getRegionTypeLabel(region.type) ?? undefined}>{region.name}</span>
                </span>
            ))}
        </p>
    )
}

export default RegionChainNote;
