import React, { useState } from 'react';
import RuleFlag from '@/shared/components/regulations/RuleFlag';
import RuleFacts from '@/shared/components/regulations/RuleFacts';
import RuleNotes from '@/shared/components/regulations/RuleNotes';
import RegulationForm from '@/shared/components/regulations/RegulationForm';
import {
    getActiveProtectedPeriod,
    formatPeriodEnd,
    hasRestrictions,
} from '@/shared/utils/regulationUtils';

/**
 * One species rule belonging to a region.
 *
 * No source badge, unlike the location editor's row: every rule here is
 * region-scoped by definition, so there is no inheritance to signal. Removal
 * is confirmed inline because it takes the rule away from every water under
 * this region, not just one.
 * @param {Object} rule - The region-scoped regulation.
 * @param {string} speciesName - Name of the species the rule covers.
 * @param {boolean} canEdit - Whether the current user may write regulations.
 * @param {boolean} isEditing - Whether this row's form is open.
 * @param {Object} [draft] - The working copy while editing.
 * @param {Function} onDraftChange - Called with the next draft.
 * @param {Function} onEdit - Opens this row's form.
 * @param {Function} onSave - Saves the draft.
 * @param {Function} onCancel - Closes the form without saving.
 * @param {Function} onRemove - Deletes the rule.
 * @param {boolean} [isSaving] - Whether a write is in flight.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function RegionRuleRow({
    rule,
    speciesName,
    canEdit,
    isEditing,
    draft,
    onDraftChange,
    onEdit,
    onSave,
    onCancel,
    onRemove,
    isSaving = false,
    today = new Date(),
}) {
    const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
    const activePeriod = getActiveProtectedPeriod(rule, today);

    return (
        <li className={`reg-row${isEditing ? ' is-editing' : ''}`}>
            <div className="reg-row-head">
                <span className="species-rule-name">
                    <i className="fa-solid fa-fish"></i>
                    {speciesName}
                </span>
            </div>

            {isEditing ? (
                <RegulationForm
                    draft={draft}
                    onChange={onDraftChange}
                    onSave={onSave}
                    onCancel={onCancel}
                    isSaving={isSaving}
                />
            ) : (
                <>
                    {activePeriod && (
                        <RuleFlag
                            icon="fa-ban"
                            variant="closed"
                            label="Protected now"
                            note={`until ${formatPeriodEnd(activePeriod)}`}
                        />
                    )}

                    {hasRestrictions(rule)
                        ? <RuleFacts rule={rule} today={today} />
                        : <p className="rule-none">No size or bag limits</p>}

                    <RuleNotes text={rule.additionalRules} />

                    {canEdit && (
                        <div className="reg-row-actions">
                            <button type="button" className="reg-action" disabled={isSaving} onClick={onEdit}>
                                <i className="fa-solid fa-pen"></i>Edit rule
                            </button>
                            {isConfirmingRemove ? (
                                <span className="reg-confirm">
                                    <span>Remove this rule from the region?</span>
                                    <button
                                        type="button"
                                        className="reg-action is-danger"
                                        disabled={isSaving}
                                        onClick={() => { setIsConfirmingRemove(false); onRemove(); }}>
                                        Yes, remove
                                    </button>
                                    <button
                                        type="button"
                                        className="reg-action is-quiet"
                                        onClick={() => setIsConfirmingRemove(false)}>
                                        Keep
                                    </button>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="reg-action is-quiet"
                                    disabled={isSaving}
                                    onClick={() => setIsConfirmingRemove(true)}>
                                    <i className="fa-solid fa-trash"></i>Remove
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </li>
    )
}

export default RegionRuleRow;
