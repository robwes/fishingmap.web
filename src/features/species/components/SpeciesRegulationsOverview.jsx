import React, { useState, useEffect } from 'react';
import ScopeRuleCard from './ScopeRuleCard';
import { regulationService } from '@/shared/services/regulationService';
import { getRegionTypeLabel } from '@/shared/utils/regulationUtils';
import { REGION_TYPE } from '@/shared/constants/regulations';
import './SpeciesRegulationsOverview.scss';

/**
 * Every rule for one species, across the whole country.
 *
 * Read-only on purpose: "what are the pike rules?" is a real angler question
 * worth answering in one place, but editing from here would mean hunting
 * through every water's rules from a species page. Rules are edited where
 * they are scoped — region admin, or the location editor.
 * @param {number} speciesId - The species being shown.
 */
function SpeciesRegulationsOverview({ speciesId }) {
    const [regulations, setRegulations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        (async () => {
            const result = await regulationService.getRegulationsForSpecies(speciesId);
            if (isActive) {
                setRegulations(result);
                setIsLoading(false);
            }
        })();

        return () => { isActive = false; };
    }, [speciesId]);

    // The API already orders these national → regions by tier → waters, so
    // the tiers are split out rather than re-sorted.
    //
    // A tier can hold several rules for one species — one per adipose fin state
    // — so even the national tier is a list. Finding the first would hide the
    // other half of a species whose variants are exactly what a reader came for.
    const national = regulations.filter(r => r.region?.type === REGION_TYPE.ROOT);
    const regional = regulations.filter(r => r.region && r.region.type !== REGION_TYPE.ROOT);
    const local = regulations.filter(r => !r.region);

    if (isLoading) {
        return null;
    }

    return (
        <section className="species-regs">
            <h2 className="species-regs-title">Rules for this species</h2>
            <p className="species-regs-lede">
                The most specific rule that covers a water is the one that applies there.
            </p>

            <div className="species-regs-tier">
                <h3 className="species-regs-tier-title">
                    <i className="fa-solid fa-flag"></i>National baseline
                </h3>
                {national.length > 0
                    ? national.map(rule => (
                        <ScopeRuleCard key={rule.id} title="All of Finland" rule={rule} />
                    ))
                    : (
                        <p className="species-regs-empty">
                            No national rule — only the regional and local rules below apply.
                        </p>
                    )}
            </div>

            <div className="species-regs-tier">
                <h3 className="species-regs-tier-title">
                    <i className="fa-solid fa-sitemap"></i>Regional variations
                </h3>
                {regional.length > 0
                    ? regional.map(rule => (
                        <ScopeRuleCard
                            key={rule.id}
                            title={rule.region.name}
                            meta={getRegionTypeLabel(rule.region.type)}
                            rule={rule}
                        />
                    ))
                    : (
                        <p className="species-regs-empty">
                            No region sets its own rule — the national baseline applies everywhere.
                        </p>
                    )}
            </div>

            <div className="species-regs-tier">
                <h3 className="species-regs-tier-title">
                    <i className="fa-solid fa-location-dot"></i>Individual waters
                </h3>
                {local.length > 0
                    ? local.map(rule => {
                        const waters = rule.locations ?? [];
                        return (
                            <ScopeRuleCard
                                key={rule.id}
                                title={waters.length === 1 ? waters[0].name : `${waters.length} waters`}
                                meta={waters.length === 1 ? 'Own rule' : 'Shared rule'}
                                rule={rule}
                                locations={waters}
                            />
                        );
                    })
                    : (
                        <p className="species-regs-empty">
                            No water sets its own rule for this species.
                        </p>
                    )}
            </div>
        </section>
    )
}

export default SpeciesRegulationsOverview;
