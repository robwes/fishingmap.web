import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RegulationRow from '@/features/locations/components/RegulationRow';
import RegionChainNote from '@/features/locations/components/RegionChainNote';
import { regulationService } from '@/shared/services/regulationService';
import { locationService } from '@/shared/services/locationService';
import { useToast } from '@/shared/context/ToastContext';
import useRegions from '@/shared/hooks/useRegions';
import {
    buildRegionChain,
    getRuleKey,
    getSpeciesRuleState,
    resolveRegionRule,
} from '@/shared/utils/regulationUtils';
import { RULE_STATE } from '@/shared/constants/regulations';
import './EditRegulationsPanel.scss';

/**
 * Seeds a draft override from whatever currently applies. A maintainer should
 * never author a rule from an empty form — the override almost always differs
 * from the inherited rule in one field, not all of them.
 *
 * The fin state carries over rather than resetting: overriding "trout with an
 * intact fin" must produce a rule about the same fish, not one that quietly
 * widens to every trout in the lake.
 * @param {number} speciesId - The species being overridden.
 * @param {number} locationId - The water the override belongs to.
 * @param {Object} [rule] - The rule that currently applies, if any.
 * @returns {Object} A draft regulation.
 */
const buildDraft = (speciesId, locationId, rule) => ({
    speciesId,
    locationIds: [locationId],
    adiposeFin: rule?.adiposeFin ?? null,
    minimumSizeCm: rule?.minimumSizeCm ?? null,
    maximumSizeCm: rule?.maximumSizeCm ?? null,
    bagLimit: rule?.bagLimit ?? null,
    bagLimitBasis: rule?.bagLimitBasis ?? null,
    isCatchAndReleaseOnly: rule?.isCatchAndReleaseOnly ?? false,
    isFullyProtected: rule?.isFullyProtected ?? false,
    mustReportCatch: rule?.mustReportCatch ?? false,
    additionalRules: rule?.additionalRules ?? null,
    protectedPeriods: (rule?.protectedPeriods ?? []).map(period => ({ ...period })),
});

/**
 * The Regulations section of the location editor.
 *
 * Only ever writes **location-scoped** rules. Regional and national rules are
 * maintained centrally, because editing one from here would change every water
 * beneath it with nothing in this UI to warn the maintainer.
 *
 * A species can resolve to more than one rule, one per adipose fin state, and
 * each is overridden separately. What this panel deliberately cannot do is
 * *invent* a variant: the rows mirror the rules that reach this water, so the
 * fin selector is hidden here and a new distinction is drawn in region admin,
 * where it applies to every water that inherits it.
 * @param {Object} location - The location being edited, including speciesRules.
 * @param {boolean} canEdit - Whether the current user may write regulations.
 * @param {Function} onLocationUpdated - Called with the refetched location after a write.
 */
function EditRegulationsPanel({ location, canEdit, onLocationUpdated }) {
    // Keyed by (species, fin), not species: a species with variant rules has a
    // row each, and a species-wide key would open all of their forms together.
    const [editingKey, setEditingKey] = useState(null);
    const [draft, setDraft] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    // Every regulation, so a species with nothing decided can still be seeded from what it
    // *would* inherit. The resolved rules can't supply that: they only contain species the
    // water already follows.
    const [regulations, setRegulations] = useState([]);
    const showToast = useToast();
    const { regions } = useRegions();

    useEffect(() => {
        (async () => setRegulations(await regulationService.getRegulations()))();
    }, []);

    const rules = location.speciesRules ?? [];
    const follows = location.followsRegionSpeciesIds ?? [];
    const regionChain = buildRegionChain(regions, location.region?.id);

    /**
     * What the water does about one species: nothing, inherit, or its own rule.
     * @param {number} speciesId - The species.
     * @returns {string} One of RULE_STATE.
     */
    const stateFor = (speciesId) =>
        getSpeciesRuleState(speciesId, rules.filter(r => r.speciesId === speciesId), follows);

    /**
     * One row per resolved rule, plus a row for species that have none, so an
     * unregulated fish still gets somewhere to add a rule.
     * @returns {Array<{species: Object, rule: Object|undefined}>} Rows in species order.
     */
    const buildRows = () => {
        return location.species.flatMap(species => {
            const speciesRules = rules.filter(r => r.speciesId === species.id);
            return speciesRules.length > 0
                ? speciesRules.map(rule => ({ species, rule }))
                : [{ species, rule: undefined }];
        });
    };

    /**
     * Refetches the location so the resolved rules reflect the write. The
     * cascade is resolved server-side, so a local edit can change which rule
     * wins and what it falls back to — neither is derivable here.
     * @returns {Promise<boolean>} True when the refetch succeeded.
     */
    const refreshLocation = async () => {
        const updated = await locationService.getLocation(location.id);
        if (!updated) {
            return false;
        }

        onLocationUpdated(updated);
        return true;
    };

    /**
     * Opens the form for one rule, seeded from what applies today.
     *
     * When nothing applies yet — the species is undecided, so no rule was resolved for it —
     * the seed comes from the region cascade computed here instead, so writing a custom rule
     * still starts from what the water would have inherited rather than from a blank form.
     * @param {Object} species - The species being overridden.
     * @param {Object} [rule] - The rule that currently applies, if any.
     */
    const startEdit = (species, rule) => {
        const seed = rule ?? resolveRegionRule(regulations, regionChain, species.id)?.rule;
        setDraft(buildDraft(species.id, location.id, seed));
        setEditingKey(getRuleKey(species.id, rule?.adiposeFin));
    };

    /**
     * Moves a species between the three states, doing whatever that transition destroys or
     * creates. The row confirms before anything is deleted.
     *
     * Order matters going to Follows: the backend refuses to start following while the water
     * has its own rule, so the rule is deleted first. That is deliberate — it keeps the two
     * states exclusive without letting a toggle silently discard authored work.
     * @param {Object} species - The species being decided.
     * @param {string} next - The chosen RULE_STATE.
     */
    const changeState = async (species, next) => {
        const current = stateFor(species.id);
        if (current === next) {
            return;
        }

        if (next === RULE_STATE.CUSTOM) {
            startEdit(species, rules.find(r => r.speciesId === species.id));
            return;
        }

        setIsSaving(true);

        if (current === RULE_STATE.CUSTOM) {
            const own = rules.filter(r =>
                r.speciesId === species.id && (r.locationIds ?? []).includes(location.id));
            for (const rule of own) {
                if (!await regulationService.deleteRegulation(rule.regulationId)) {
                    setIsSaving(false);
                    showToast('The rule could not be removed.', 'error');
                    return;
                }
            }
        }

        const written = await regulationService.setFollowsRegion(
            location.id, species.id, next === RULE_STATE.FOLLOWS);
        if (!written) {
            setIsSaving(false);
            showToast('The change could not be saved.', 'error');
            return;
        }

        const refreshed = await refreshLocation();
        setIsSaving(false);
        showToast(
            refreshed
                ? `${species.name} now ${next === RULE_STATE.FOLLOWS ? 'follows the region' : 'has no rule recorded'} here.`
                : 'Saved, but the page could not be refreshed.',
            refreshed ? 'success' : 'error'
        );
    };

    const closeForm = () => {
        setEditingKey(null);
        setDraft(null);
    };

    /**
     * Saves the draft — updating the existing rule when this water already has
     * its own, creating one otherwise.
     */
    const saveDraft = async () => {
        const current = rules.find(r =>
            r.speciesId === draft.speciesId
            && (r.adiposeFin ?? null) === (draft.adiposeFin ?? null));
        const isOwnRule = current?.regulationId != null
            && (current.locationIds ?? []).includes(location.id);

        setIsSaving(true);
        const saved = isOwnRule
            ? await regulationService.updateRegulation(current.regulationId, draft)
            : await regulationService.createRegulation(draft);

        if (!saved) {
            setIsSaving(false);
            showToast('The rule could not be saved.', 'error');
            return;
        }

        const refreshed = await refreshLocation();
        setIsSaving(false);
        closeForm();
        showToast(
            refreshed ? 'Rule saved for this water.' : 'Rule saved, but the page could not be refreshed.',
            refreshed ? 'success' : 'error'
        );
    };

    return (
        <div className="reg-panel">
            <div className="reg-panel-intro">
                <RegionChainNote regions={regionChain} />
                <p className="reg-panel-note">
                    <i className="fa-solid fa-circle-info"></i>
                    Regional and national rules are maintained centrally. Here you can make this
                    water stricter or looser than the rule it inherits.
                    {canEdit && <> <Link className="reg-link" to="/regions">Manage regional rules</Link></>}
                </p>
            </div>

            {location.species.length === 0 ? (
                <p className="reg-empty-note">
                    No species listed for this water yet — add some under Species &amp; permits first.
                </p>
            ) : (
                <ul className="reg-list">
                    {buildRows().map(({ species, rule }, index, rows) => {
                        const key = getRuleKey(species.id, rule?.adiposeFin);
                        return (
                            <RegulationRow
                                key={key}
                                species={species}
                                rule={rule}
                                state={stateFor(species.id)}
                                // The state is a fact about the species, not about one of its
                                // fin variants, so only the first row of a species offers it.
                                showStateChoice={rows.findIndex(r => r.species.id === species.id) === index}
                                locationId={location.id}
                                canEdit={canEdit}
                                isEditing={editingKey === key}
                                draft={draft}
                                onDraftChange={setDraft}
                                onEdit={() => startEdit(species, rule)}
                                onSave={saveDraft}
                                onCancel={closeForm}
                                onStateChange={(next) => changeState(species, next)}
                                isSaving={isSaving}
                            />
                        );
                    })}
                </ul>
            )}
        </div>
    )
}

export default EditRegulationsPanel;
