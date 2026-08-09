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
import { getRegionTypeLabel, buildRegionChain } from '@/shared/utils/regulationUtils';
import './RegionAdmin.scss';

/** An empty region-scoped rule for a species. */
const emptyRule = (speciesId) => ({
    speciesId,
    minimumSizeCm: null,
    maximumSizeCm: null,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
});

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
    const [editingSpeciesId, setEditingSpeciesId] = useState(null);
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
    const unruledSpecies = species.filter(s => !regionRules.some(r => r.speciesId === s.id));
    const speciesName = (id) => species.find(s => s.id === id)?.name ?? 'Unknown species';

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
        const chain = buildRegionChain(regions, selectedRegion?.parentRegionId);

        for (let i = chain.length - 1; i >= 0; i--) {
            const found = regulations.find(r => r.regionId === chain[i].id && r.speciesId === speciesId);
            if (found) {
                return { rule: found, region: chain[i] };
            }
        }

        return null;
    };

    /** Opens the form for an existing rule. */
    const startEdit = (rule) => {
        setDraft({ ...rule });
        setPrefilledFrom(null);
        setEditingSpeciesId(rule.speciesId);
    };

    /** Opens the form for a species this region doesn't rule yet. */
    const startAdd = (speciesId) => {
        const inherited = findAncestorRule(speciesId);
        setDraft(inherited
            ? { ...emptyRule(speciesId), ...inherited.rule, id: undefined, speciesId }
            : emptyRule(speciesId));
        setPrefilledFrom(inherited?.region.name ?? null);
        setEditingSpeciesId(speciesId);
    };

    const closeForm = () => {
        setEditingSpeciesId(null);
        setDraft(null);
        setPrefilledFrom(null);
    };

    const saveDraft = async () => {
        const existing = regionRules.find(r => r.speciesId === draft.speciesId);
        // Region-scoped: regionId set, locationIds empty. toRegulationBody
        // enforces the XOR, but be explicit about which side we're on.
        const payload = { ...draft, regionId: selectedId, locationIds: [] };

        setIsSaving(true);
        const saved = existing
            ? await regulationService.updateRegulation(existing.id, payload)
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
                                        {regionRules.length === 0 && editingSpeciesId == null && (
                                            <p className="species-regs-empty">
                                                No species rules on this region yet — waters here inherit
                                                from further up the tree.
                                            </p>
                                        )}

                                        {editingSpeciesId != null
                                            && !regionRules.some(r => r.speciesId === editingSpeciesId) && (
                                            <li className="reg-row is-editing">
                                                <div className="reg-row-head">
                                                    <span className="species-rule-name">
                                                        <i className="fa-solid fa-fish"></i>
                                                        {speciesName(editingSpeciesId)}
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
                                                isEditing={editingSpeciesId === rule.speciesId}
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

                                    {unruledSpecies.length > 0 && editingSpeciesId == null && (
                                        <div className="region-add-rule">
                                            <label className="reg-field-label" htmlFor="region-add-species">
                                                Add a rule for
                                            </label>
                                            <select
                                                id="region-add-species"
                                                className="edit-input"
                                                value=""
                                                onChange={(e) => e.target.value && startAdd(Number(e.target.value))}>
                                                <option value="">Select species…</option>
                                                {unruledSpecies.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
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
