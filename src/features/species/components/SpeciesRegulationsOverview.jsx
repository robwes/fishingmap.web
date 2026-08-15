import React, { useState, useEffect } from 'react';
import ScopeRuleCard from './ScopeRuleCard';
import { regulationService } from '@/shared/services/regulationService';
import { getRegionTypeLabel } from '@/shared/utils/regulationUtils';
import { REGION_TYPE } from '@/shared/constants/regulations';
import './SpeciesRegulationsOverview.scss';

/**
 * The rules for one species across the country.
 *
 * An angler's page, not a maintainer's. It answers "what are the pike rules?" and stops
 * there: the per-water exceptions are deliberately absent, because they are one entry per
 * water that diverges — unbounded as the site grows, and not what someone reading about a
 * fish came for. They belong on an admin screen, and the backend doesn't return them here.
 *
 * Read-only for the same reason it is angler-facing: rules are edited where they are scoped,
 * in region admin or the location editor.
 * @param {number} speciesId - The species being shown.
 */
function SpeciesRegulationsOverview({ speciesId }) {
    const [regulations, setRegulations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        (async () => {
            const result = await regulationService.getRegionRulesForSpecies(speciesId);
            if (isActive) {
                setRegulations(result);
                setIsLoading(false);
            }
        })();

        return () => { isActive = false; };
    }, [speciesId]);

    // The API already orders these national → regions by tier, so the tiers are split out
    // rather than re-sorted. A tier can hold several rules for one species — one per adipose
    // fin state — so even the national tier is a list.
    const national = regulations.filter(r => r.region?.type === REGION_TYPE.ROOT);
    const regional = regulations.filter(r => r.region && r.region.type !== REGION_TYPE.ROOT);

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
                        // States what we hold, not what the law says. "Only the regional
                        // rules apply" would be a claim about Finnish law inferred from an
                        // empty table, and a national rule we simply haven't entered yet
                        // still binds the angler reading this.
                        <p className="species-regs-empty">
                            No national rule recorded for this species.
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
                            No regional rules recorded for this species.
                        </p>
                    )}
            </div>

            {/* Carries the general limitation once, so each tier above can state a plain
                fact about our records instead of hedging three times. Without it the page
                reads as the complete answer: an individual water can be stricter than
                anything shown, and an empty tier means nothing has been entered — not that
                no such rule exists. */}
            <p className="species-regs-caveat">
                <i className="fa-solid fa-circle-info"></i>
                <span>
                    Only the rules recorded here are shown, and individual waters can set their
                    own. Check the page for the water you are fishing before you go.
                </span>
            </p>
        </section>
    )
}

export default SpeciesRegulationsOverview;
