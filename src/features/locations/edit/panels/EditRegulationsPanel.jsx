import React, { useState } from 'react';
import RegulationRow from '@/features/locations/components/RegulationRow';
import RegionChainNote from '@/features/locations/components/RegionChainNote';
import { regulationService } from '@/shared/services/regulationService';
import { locationService } from '@/shared/services/locationService';
import { useToast } from '@/shared/context/ToastContext';
import './EditRegulationsPanel.scss';

/**
 * Seeds a draft override from whatever currently applies. A maintainer should
 * never author a rule from an empty form — the override almost always differs
 * from the inherited rule in one field, not all of them.
 * @param {number} speciesId - The species being overridden.
 * @param {number} locationId - The water the override belongs to.
 * @param {Object} [rule] - The rule that currently applies, if any.
 * @returns {Object} A draft regulation.
 */
const buildDraft = (speciesId, locationId, rule) => ({
    speciesId,
    locationIds: [locationId],
    minimumSizeCm: rule?.minimumSizeCm ?? null,
    maximumSizeCm: rule?.maximumSizeCm ?? null,
    bagLimit: rule?.bagLimit ?? null,
    bagLimitBasis: rule?.bagLimitBasis ?? null,
    isCatchAndReleaseOnly: rule?.isCatchAndReleaseOnly ?? false,
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
 * @param {Object} location - The location being edited, including speciesRules.
 * @param {boolean} canEdit - Whether the current user may write regulations.
 * @param {Function} onLocationUpdated - Called with the refetched location after a write.
 */
function EditRegulationsPanel({ location, canEdit, onLocationUpdated }) {
    const [editingSpeciesId, setEditingSpeciesId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const showToast = useToast();

    const rules = location.speciesRules ?? [];
    const ruleFor = (speciesId) => rules.find(r => r.speciesId === speciesId);

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

    /** Opens the form for a species, seeded from the rule that applies today. */
    const startEdit = (speciesId) => {
        const current = ruleFor(speciesId);
        setDraft(buildDraft(speciesId, location.id, current));
        setEditingSpeciesId(speciesId);
    };

    const closeForm = () => {
        setEditingSpeciesId(null);
        setDraft(null);
    };

    /**
     * Saves the draft — updating the existing rule when this water already has
     * its own, creating one otherwise.
     */
    const saveDraft = async () => {
        const current = ruleFor(draft.speciesId);
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

    /** Deletes this water's own rule, letting whatever it shadowed apply again. */
    const revertRule = async (speciesId) => {
        const current = ruleFor(speciesId);
        if (current?.regulationId == null) {
            return;
        }

        setIsSaving(true);
        const deleted = await regulationService.deleteRegulation(current.regulationId);

        if (!deleted) {
            setIsSaving(false);
            showToast('The rule could not be removed.', 'error');
            return;
        }

        const refreshed = await refreshLocation();
        setIsSaving(false);
        showToast(
            refreshed ? 'Rule removed from this water.' : 'Rule removed, but the page could not be refreshed.',
            refreshed ? 'success' : 'error'
        );
    };

    return (
        <div className="reg-panel">
            <div className="reg-panel-intro">
                <RegionChainNote regions={location.region ? [location.region] : []} />
                <p className="reg-panel-note">
                    <i className="fa-solid fa-circle-info"></i>
                    Regional and national rules are maintained centrally. Here you can make this
                    water stricter or looser than the rule it inherits.
                </p>
            </div>

            {location.species.length === 0 ? (
                <p className="reg-empty-note">
                    No species listed for this water yet — add some under Species &amp; permits first.
                </p>
            ) : (
                <ul className="reg-list">
                    {location.species.map(species => (
                        <RegulationRow
                            key={species.id}
                            species={species}
                            rule={ruleFor(species.id)}
                            locationId={location.id}
                            canEdit={canEdit}
                            isEditing={editingSpeciesId === species.id}
                            draft={draft}
                            onDraftChange={setDraft}
                            onEdit={() => startEdit(species.id)}
                            onSave={saveDraft}
                            onCancel={closeForm}
                            onRevert={() => revertRule(species.id)}
                            isSaving={isSaving}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}

export default EditRegulationsPanel;
