import React, { useState } from 'react';
import RuleSourceBadge from './RuleSourceBadge';
import RuleAlerts from '@/shared/components/regulations/RuleAlerts';
import RuleFacts from '@/shared/components/regulations/RuleFacts';
import RuleNotes from '@/shared/components/regulations/RuleNotes';
import RegulationForm from '@/shared/components/regulations/RegulationForm';
import RuleStateChoice from './RuleStateChoice';
import {
    getRuleSourceKind,
    getRuleSourceLabel,
    getAdiposeFinLabel,
    getAdiposeFinHint,
    hasRestrictions,
} from '@/shared/utils/regulationUtils';
import { RULE_STATE } from '@/shared/constants/regulations';
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
 * A fourth possibility sits underneath all three: nothing decided at all. Inheritance is
 * opt-in, so a species reaches this row with no rule and no decision, and the state choice
 * at the top is how one gets made.
 *
 * @param {Object} species - The species, with id and name.
 * @param {Object} [rule] - The resolved rule for this species at this water.
 * @param {string} [state] - One of RULE_STATE.
 * @param {boolean} [showStateChoice] - Whether this row owns the species-level state control.
 * @param {number} locationId - The water being edited.
 * @param {boolean} canEdit - Whether the current user may write regulations.
 * @param {boolean} isEditing - Whether this row's form is open.
 * @param {Object} [draft] - The working copy while editing.
 * @param {Function} onDraftChange - Called with the next draft.
 * @param {Function} onEdit - Opens this row's form.
 * @param {Function} onSave - Saves the draft.
 * @param {Function} onCancel - Closes the form without saving.
 * @param {Function} [onStateChange] - Called with the chosen RULE_STATE. Leaving Custom
 *   deletes this water's rule, so that transition is confirmed here first.
 * @param {boolean} [isSaving] - Whether a save or revert is in flight.
 * @param {Date} [today] - Reference date, injectable for tests.
 */
function RegulationRow({
    species,
    rule,
    state = RULE_STATE.UNDECIDED,
    showStateChoice = true,
    locationId,
    canEdit,
    isEditing,
    draft,
    onDraftChange,
    onEdit,
    onSave,
    onCancel,
    onStateChange,
    isSaving = false,
    today = new Date(),
}) {
    // The state the user picked but hasn't confirmed. Only set when leaving Custom, which
    // deletes an authored rule — the other transitions destroy nothing and go straight through.
    const [pendingState, setPendingState] = useState(null);

    const isLocal = getRuleSourceKind(rule?.source) === 'location';
    const otherWaters = (rule?.locationIds ?? []).filter(id => id !== locationId);
    const isSharedWithOtherWaters = isLocal && otherWaters.length > 0;
    const isRegulated = hasRestrictions(rule);
    const fallbackLabel = getRuleSourceLabel(rule?.fallsBackTo?.source);
    const finLabel = getAdiposeFinLabel(rule?.adiposeFin);
    const finHint = getAdiposeFinHint(rule?.adiposeFin);

    /**
     * Applies a state change, asking first when it would throw away this water's own rule.
     * @param {string} next - The chosen RULE_STATE.
     */
    const requestStateChange = (next) => {
        if (state === RULE_STATE.CUSTOM && next !== RULE_STATE.CUSTOM) {
            setPendingState(next);
            return;
        }

        onStateChange(next);
    };

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
                {/* A species can occupy several rows here, one per fin state, so
                    the name alone no longer says which rule this is. */}
                {finLabel && (
                    <span className="reg-row-fin">
                        {finLabel}
                        {finHint && <span className="reg-row-fin-hint">{finHint}</span>}
                    </span>
                )}
                {rule
                    ? (isRegulated
                        ? <RuleSourceBadge source={rule.source} />
                        : <span className="rule-source">No limits set</span>)
                    : <span className="rule-source">{state === RULE_STATE.FOLLOWS ? 'Nothing inherited' : 'Not set'}</span>}
            </div>

            {showStateChoice && canEdit && !isEditing && (
                <>
                    <RuleStateChoice
                        value={state}
                        disabled={isSaving || pendingState != null}
                        onChange={requestStateChange}
                        customHint={isSharedWithOtherWaters
                            ? 'This rule is shared with other waters — edit it where it is managed.'
                            : undefined}
                    />
                    {pendingState && (
                        <span className="reg-confirm">
                            <span>
                                {pendingState === RULE_STATE.FOLLOWS
                                    ? `Delete this water's own rule and ${fallbackLabel ? `fall back to the ${fallbackLabel} rule` : 'follow its region'}?`
                                    : 'Delete this water’s own rule and leave the species undecided?'}
                            </span>
                            <button
                                type="button"
                                className="reg-action is-danger"
                                disabled={isSaving}
                                onClick={() => { const next = pendingState; setPendingState(null); onStateChange(next); }}>
                                Yes, delete it
                            </button>
                            <button
                                type="button"
                                className="reg-action is-quiet"
                                onClick={() => setPendingState(null)}>
                                Keep the rule
                            </button>
                        </span>
                    )}
                </>
            )}

            {state === RULE_STATE.UNDECIDED && !isEditing && (
                <p className="reg-unrecorded-note">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>
                        Nothing is published for this species here. National and regional
                        rules still apply to this water — choose whether it follows them.
                    </span>
                </p>
            )}

            {isEditing ? (
                <RegulationForm
                    draft={draft}
                    onChange={onDraftChange}
                    onSave={onSave}
                    onCancel={onCancel}
                    isSaving={isSaving}
                    // The rows mirror the rules that reach this water. Drawing a
                    // new fin distinction is a regional decision, so it is made
                    // in region admin rather than one water at a time.
                    canSetAdiposeFin={false}
                />
            ) : (
                <>
                    <RuleAlerts rule={rule} today={today} />

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

                    {/* Only editing lives here now. Every transition between the three
                        states goes through RuleStateChoice above, so there is one place
                        that answers "what does this water do about this species". */}
                    {canEdit && isLocal && !isSharedWithOtherWaters && (
                        <div className="reg-row-actions">
                            <button type="button" className="reg-action" disabled={isSaving} onClick={onEdit}>
                                <i className="fa-solid fa-pen"></i>Edit rule
                            </button>
                        </div>
                    )}
                </>
            )}
        </li>
    )
}

export default RegulationRow;
