import React, { useState } from 'react';
import RuleSourceBadge from './RuleSourceBadge';
import RuleFlag from '@/shared/components/regulations/RuleFlag';
import RuleFacts from '@/shared/components/regulations/RuleFacts';
import RuleNotes from '@/shared/components/regulations/RuleNotes';
import RegulationForm from '@/shared/components/regulations/RegulationForm';
import {
    getRuleSourceKind,
    getRuleSourceLabel,
    getActiveProtectedPeriod,
    formatPeriodEnd,
    hasRestrictions,
} from '@/shared/utils/regulationUtils';
import './RegulationRow.scss';

/**
 * One species in the location editor: the rule that applies here, and what can
 * be done about it.
 *
 * Three states, and the distinction matters more than it looks:
 *
 * - **Inherited** — the rule belongs to a region. Editing it here would change
 *   every water under that region, so the only action offered is creating an
 *   override for this water.
 * - **Local, this water only** — freely editable, and revertible back to
 *   whatever it currently shadows.
 * - **Local, shared with other waters** — the regulation↔location relation is
 *   many-to-many, so saving here would silently rewrite the rule at those other
 *   waters. Rendered read-only with a note saying so.
 *
 * @param {Object} species - The species, with id and name.
 * @param {Object} [rule] - The resolved rule for this species at this water.
 * @param {number} locationId - The water being edited.
 * @param {boolean} canEdit - Whether the current user may write regulations.
 * @param {boolean} isEditing - Whether this row's form is open.
 * @param {Object} [draft] - The working copy while editing.
 * @param {Function} onDraftChange - Called with the next draft.
 * @param {Function} onEdit - Opens this row's form.
 * @param {Function} onSave - Saves the draft.
 * @param {Function} onCancel - Closes the form without saving.
 * @param {Function} onRevert - Deletes the local rule.
 * @param {boolean} [isSaving] - Whether a save or revert is in flight.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function RegulationRow({
    species,
    rule,
    locationId,
    canEdit,
    isEditing,
    draft,
    onDraftChange,
    onEdit,
    onSave,
    onCancel,
    onRevert,
    isSaving = false,
    today = new Date(),
}) {
    const [isConfirmingRevert, setIsConfirmingRevert] = useState(false);

    const isLocal = getRuleSourceKind(rule?.source) === 'location';
    const otherWaters = (rule?.locationIds ?? []).filter(id => id !== locationId);
    const isSharedWithOtherWaters = isLocal && otherWaters.length > 0;
    const activePeriod = getActiveProtectedPeriod(rule, today);
    const isRegulated = hasRestrictions(rule);
    const fallbackLabel = getRuleSourceLabel(rule?.fallsBackTo?.source);

    const classNames = ['reg-row'];
    if (isLocal) {
        classNames.push('is-override');
    }
    if (isSharedWithOtherWaters) {
        classNames.push('is-locked');
    }
    if (isEditing) {
        classNames.push('is-editing');
    }

    return (
        <li className={classNames.join(' ')}>
            <div className="reg-row-head">
                <span className="species-rule-name">
                    <i className="fa-solid fa-fish"></i>
                    {species.name}
                </span>
                {isRegulated
                    ? <RuleSourceBadge source={rule.source} />
                    : <span className="rule-source">Not regulated</span>}
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

                    {isRegulated
                        ? <RuleFacts rule={rule} today={today} />
                        : <p className="rule-none">No size or bag limits apply here.</p>}

                    {isRegulated && <RuleNotes text={rule.additionalRules} />}

                    {isSharedWithOtherWaters && (
                        <p className="reg-locked-note">
                            <i className="fa-solid fa-lock"></i>
                            <span>
                                This rule also applies to {otherWaters.length}{' '}
                                {otherWaters.length > 1 ? 'other waters' : 'other water'} — edit it
                                where it is managed so you don&apos;t change them too.
                            </span>
                        </p>
                    )}

                    {canEdit && !isSharedWithOtherWaters && (
                        <div className="reg-row-actions">
                            {isLocal ? (
                                <>
                                    <button type="button" className="reg-action" disabled={isSaving} onClick={onEdit}>
                                        <i className="fa-solid fa-pen"></i>Edit rule
                                    </button>
                                    {isConfirmingRevert ? (
                                        <span className="reg-confirm">
                                            <span>
                                                {fallbackLabel
                                                    ? `Fall back to the ${fallbackLabel} rule?`
                                                    : 'Remove this rule entirely?'}
                                            </span>
                                            <button
                                                type="button"
                                                className="reg-action is-danger"
                                                disabled={isSaving}
                                                onClick={() => { setIsConfirmingRevert(false); onRevert(); }}>
                                                Yes, revert
                                            </button>
                                            <button
                                                type="button"
                                                className="reg-action is-quiet"
                                                onClick={() => setIsConfirmingRevert(false)}>
                                                Keep
                                            </button>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="reg-action is-quiet"
                                            disabled={isSaving}
                                            onClick={() => setIsConfirmingRevert(true)}>
                                            <i className="fa-solid fa-rotate-left"></i>
                                            {fallbackLabel ? 'Revert to inherited rule' : 'Remove rule'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button type="button" className="reg-action" disabled={isSaving} onClick={onEdit}>
                                    <i className="fa-solid fa-location-dot"></i>Override for this water
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </li>
    )
}

export default RegulationRow;
