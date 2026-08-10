import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RegionTree from './components/RegionTree';
import RegionRuleRow from './components/RegionRuleRow';
import AddRegionForm from './components/AddRegionForm';
import RegulationForm from '@/shared/components/regulations/RegulationForm';
import FloatingSpinner from '@/shared/components/spinner/FloatingSpinner';
import { regionService } from '@/shared/services/regionService';
import { regulationService } from '@/shared/services/regulationService';
import { speciesService } from '@/shared/services/speciesService';
import { locationService } from '@/shared/services/locationService';
import { useToast } from '@/shared/context/ToastContext';
import {
    getRegionTypeLabel,
    buildRegionChain,
    resolveRegionRule,
    getRuleKey,
} from '@/shared/utils/regulationUtils';
import { ADIPOSE_FIN } from '@/shared/constants/regulations';
import '@/shared/components/regulations/regulationFields.scss';
import './RegionAdmin.scss';

/** An empty region-scoped rule for a species. */
const emptyRule = (speciesId, adiposeFin = null) => ({
    speciesId,
    adiposeFin,
    minimumSizeCm: null,
    maximumSizeCm: null,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    isFullyProtected: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
});

// Every way a rule can be narrowed by fin state, the unnarrowed one first. A
// species can hold one rule per entry and no more.
const FIN_STATES = [null, ADIPOSE_FIN.INTACT, ADIPOSE_FIN.CLIPPED];

/**
 * Regions and the rules attached to them.
 *
 * Organised as "one region, all its species" rather than by species, because
 * regulation updates arrive region-shaped in the real world: an ELY publishes
 * one decision covering many species at once.
 *
 * Editing here is the counterpart to the location editor — this screen owns
 * the rules that cascade, the location editor owns the per-water overrides.
 */
function RegionAdmin() {
    const [regions, setRegions] = useState([]);
    const [regulations, setRegulations] = useState([]);
    const [species, setSpecies] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    // Which rule's form is open, as a (species, fin) key rather than a species
    // id: a species can hold several rules here, and keying on the species
    // alone would open every one of its forms at once.
    const [editingKey, setEditingKey] = useState(null);
    // The row being edited, or null when the open form is a new rule.
    const [editingRuleId, setEditingRuleId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [prefilledFrom, setPrefilledFrom] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const showToast = useToast();

    useEffect(() => {
        (async () => {
            const [loadedRegions, loadedRegulations, loadedSpecies, loadedLocations] = await Promise.all([
                regionService.getRegions(),
                regulationService.getRegulations(),
                speciesService.getSpecies(),
                locationService.getLocationsSummary(),
            ]);

            setRegions(loadedRegions);
            setRegulations(loadedRegulations);
            setSpecies(loadedSpecies);
            setLocations(loadedLocations);
            setSelectedId(loadedRegions.find(r => r.parentRegionId == null)?.id ?? null);
            setIsLoading(false);
        })();
    }, []);

    const selectedRegion = regions.find(r => r.id === selectedId) ?? null;
    const regionRules = regulations.filter(r => r.regionId === selectedId);
    const speciesName = (id) => species.find(s => s.id === id)?.name ?? 'Unknown species';

    /**
     * The fin states a species has no rule for at this region.
     * @param {number} speciesId - The species.
     * @returns {Array<string|null>} Free fin states, unnarrowed first.
     */
    const freeFinStates = (speciesId) => {
        const taken = regionRules
            .filter(r => r.speciesId === speciesId)
            .map(r => r.adiposeFin ?? null);
        return FIN_STATES.filter(fin => !taken.includes(fin));
    };

    // Species that can still take a rule here. A species already ruled stays in
    // the list while it has a free fin state, because a second rule for the same
    // species is how a variant gets entered.
    const addableSpecies = species.filter(s => freeFinStates(s.id).length > 0);

    // Every water under this region, however deep — the blast radius of a rule
    // saved here.
    const coveredLocations = locations.filter(l =>
        l.regionId != null && buildRegionChain(regions, l.regionId).some(r => r.id === selectedId)
    );

    /** Reloads the regulation list after a write. */
    const refreshRegulations = async () => {
        setRegulations(await regulationService.getRegulations());
    };

    /**
     * The nearest ancestor region that already rules this species. A new rule
     * starts from it so a maintainer adjusts a difference rather than retyping
     * a whole regulation.
     * @param {number} speciesId - The species being ruled.
     * @returns {{rule: Object, region: Object}|null} The inherited rule and its region.
     */
    const findAncestorRule = (speciesId) => {
        // The chain stops at the parent, so the region's own rules can't
        // pre-fill a rule it doesn't have yet.
        return resolveRegionRule(
            regulations,
            buildRegionChain(regions, selectedRegion?.parentRegionId),
            speciesId
        );
    };

    /** Opens the form for an existing rule. */
    const startEdit = (rule) => {
        setDraft({ ...rule });
        setPrefilledFrom(null);
        setEditingRuleId(rule.id);
        setEditingKey(getRuleKey(rule.speciesId, rule.adiposeFin));
    };

    /**
     * Opens the form for a rule this region doesn't have yet.
     *
     * The fin state defaults to the first one still free, so adding a second
     * rule for an already-ruled species lands on a variant rather than
     * colliding with the rule that exists.
     * @param {number} speciesId - The species being ruled.
     */
    const startAdd = (speciesId) => {
        const fin = freeFinStates(speciesId)[0] ?? null;
        const inherited = findAncestorRule(speciesId);
        setDraft(inherited
            ? { ...emptyRule(speciesId, fin), ...inherited.rule, id: undefined, speciesId, adiposeFin: fin }
            : emptyRule(speciesId, fin));
        setPrefilledFrom(inherited?.region.name ?? null);
        setEditingRuleId(null);
        setEditingKey(getRuleKey(speciesId, fin));
    };

    const closeForm = () => {
        setEditingKey(null);
        setEditingRuleId(null);
        setDraft(null);
        setPrefilledFrom(null);
    };

    const saveDraft = async () => {
        // Adding, not editing: refuse to write over a rule that already covers
        // the same species and fin state. The fin selector is free to move
        // while the form is open, so "add" can land on an occupied pair.
        const collision = regionRules.find(r =>
            r.id !== editingRuleId
            && r.speciesId === draft.speciesId
            && (r.adiposeFin ?? null) === (draft.adiposeFin ?? null));
        if (collision) {
            showToast(
                `${speciesName(draft.speciesId)} already has a rule for that fin state on ${selectedRegion.name}.`,
                'error');
            return;
        }

        // Region-scoped: regionId set, locationIds empty. toRegulationBody
        // enforces the XOR, but be explicit about which side we're on.
        const payload = { ...draft, regionId: selectedId, locationIds: [] };

        setIsSaving(true);
        const saved = editingRuleId != null
            ? await regulationService.updateRegulation(editingRuleId, payload)
            : await regulationService.createRegulation(payload);

        if (!saved) {
            setIsSaving(false);
            showToast('The rule could not be saved.', 'error');
            return;
        }

        await refreshRegulations();
        setIsSaving(false);
        closeForm();
        showToast(`${speciesName(draft.speciesId)} rule saved for ${selectedRegion.name}.`, 'success');
    };

    const removeRule = async (rule) => {
        setIsSaving(true);
        const removed = await regulationService.deleteRegulation(rule.id);

        if (!removed) {
            setIsSaving(false);
            showToast('The rule could not be removed.', 'error');
            return;
        }

        await refreshRegulations();
        setIsSaving(false);
        showToast(`${speciesName(rule.speciesId)} rule removed from ${selectedRegion.name}.`, 'success');
    };

    const addRegion = async (region) => {
        setIsSaving(true);
        const added = await regionService.createRegion(region);

        if (!added) {
            setIsSaving(false);
            showToast('The region could not be added.', 'error');
            return;
        }

        setRegions(await regionService.getRegions());
        setIsSaving(false);
        showToast(`${region.name} added under ${selectedRegion.name}.`, 'success');
    };

    return (
        <div className="region-admin page">
            {isLoading && <FloatingSpinner />}

            <div className="container">
                <h1 className="page-title">Regions &amp; regulations</h1>

                {!isLoading && regions.length === 0 ? (
                    <p className="species-regs-empty">
                        No regions exist yet. The backend seeds a National region on first run —
                        without it there is no tree to build on.
                    </p>
                ) : (
                    <div className="region-admin-layout">
                        <aside className="region-tree">
                            <div className="region-tree-head">Region tree</div>
                            <RegionTree
                                regions={regions}
                                selectedId={selectedId}
                                onSelect={(id) => { setSelectedId(id); closeForm(); }}
                            />
                            {selectedRegion && (
                                <AddRegionForm
                                    parentRegion={selectedRegion}
                                    onAdd={addRegion}
                                    isSaving={isSaving}
                                />
                            )}
                        </aside>

                        <section className="region-detail">
                            {!selectedRegion ? (
                                <p className="species-regs-empty">Select a region.</p>
                            ) : (
                                <>
                                    <div className="region-detail-head">
                                        <div>
                                            <h2 className="region-detail-title">{selectedRegion.name}</h2>
                                            <p className="region-detail-meta">
                                                {getRegionTypeLabel(selectedRegion.type)}
                                                {selectedRegion.parentRegionId != null && (
                                                    <> · inside {regions.find(r => r.id === selectedRegion.parentRegionId)?.name}</>
                                                )}
                                            </p>
                                        </div>
                                        <p className="region-blast-note">
                                            <i className="fa-solid fa-triangle-exclamation"></i>
                                            Rules here apply to {coveredLocations.length}{' '}
                                            {coveredLocations.length === 1 ? 'water' : 'waters'} in this
                                            region and below.
                                        </p>
                                    </div>

                                    <ul className="reg-list">
                                        {regionRules.length === 0 && editingKey == null && (
                                            <p className="species-regs-empty">
                                                No species rules on this region yet — waters here inherit
                                                from further up the tree.
                                            </p>
                                        )}

                                        {editingKey != null && editingRuleId == null && (
                                            <li className="reg-row is-editing">
                                                <div className="reg-row-head">
                                                    <span className="species-rule-name">
                                                        <i className="fa-solid fa-fish"></i>
                                                        {speciesName(draft.speciesId)}
                                                    </span>
                                                    <span className="rule-source">New rule</span>
                                                </div>
                                                <p className="reg-prefill-note">
                                                    <i className={`fa-solid ${prefilledFrom ? 'fa-turn-down' : 'fa-circle-info'}`}></i>
                                                    {prefilledFrom
                                                        ? `Pre-filled from the ${prefilledFrom} rule — adjust only what differs here.`
                                                        : 'No rule for this species further up the tree — starting empty.'}
                                                </p>
                                                <RegulationForm
                                                    draft={draft}
                                                    onChange={setDraft}
                                                    onSave={saveDraft}
                                                    onCancel={closeForm}
                                                    isSaving={isSaving}
                                                />
                                            </li>
                                        )}

                                        {regionRules.map(rule => (
                                            <RegionRuleRow
                                                key={rule.id}
                                                rule={rule}
                                                speciesName={speciesName(rule.speciesId)}
                                                canEdit
                                                isEditing={editingRuleId === rule.id}
                                                draft={draft}
                                                onDraftChange={setDraft}
                                                onEdit={() => startEdit(rule)}
                                                onSave={saveDraft}
                                                onCancel={closeForm}
                                                onRemove={() => removeRule(rule)}
                                                isSaving={isSaving}
                                            />
                                        ))}
                                    </ul>

                                    {addableSpecies.length > 0 && editingKey == null && (
                                        <div className="region-add-rule">
                                            <label className="reg-field-label" htmlFor="region-add-species">
                                                Add a rule for
                                            </label>
                                            <select
                                                id="region-add-species"
                                                className="reg-input"
                                                value=""
                                                onChange={(e) => e.target.value && startAdd(Number(e.target.value))}>
                                                <option value="">Select species…</option>
                                                {addableSpecies.map(s => {
                                                    const existing = regionRules.filter(r => r.speciesId === s.id).length;
                                                    return (
                                                        <option key={s.id} value={s.id}>
                                                            {/* Says why a species already ruled here is
                                                                still listed: the next rule is a variant. */}
                                                            {existing > 0
                                                                ? `${s.name} — another rule (${existing} here)`
                                                                : s.name}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}

                                    <div className="region-waters">
                                        <h3 className="region-waters-title">
                                            <i className="fa-solid fa-water"></i>Waters covered
                                        </h3>
                                        {coveredLocations.length > 0 ? (
                                            <p className="region-waters-links">
                                                {coveredLocations.map((l, i) => (
                                                    <React.Fragment key={l.id}>
                                                        {i > 0 && ', '}
                                                        <Link className="reg-link" to={`/locations/${l.id}`}>{l.name}</Link>
                                                    </React.Fragment>
                                                ))}
                                            </p>
                                        ) : (
                                            <p className="species-regs-empty">
                                                No waters are assigned to this region yet.
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RegionAdmin;
