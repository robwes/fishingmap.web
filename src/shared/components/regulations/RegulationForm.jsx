import React from 'react';
import PeriodEditor from './PeriodEditor';
import { BAG_LIMIT_BASIS_LABELS } from '@/shared/constants/regulations';
import '@/shared/components/regulations/regulationFields.scss';
import './RegulationForm.scss';

/**
 * Parses a number input, treating an empty field as "not set" rather than 0.
 * @param {string} value - The raw input value.
 * @returns {number|null} The number, or null when the field is empty.
 */
const toNumberOrNull = (value) => (value === '' || value == null ? null : Number(value));

/**
 * The editable fields of a species regulation.
 *
 * Sizes accept decimals because the backend stores them as `decimal?`, not
 * `int?`. The bag-limit basis is deliberately optional: a regulation that
 * doesn't say what its limit counts against must not be saved as if it said
 * "per day", so the field can stay unset and the rule then renders as a bare
 * count.
 * @param {Object} draft - The working copy of the rule.
 * @param {Function} onChange - Called with the next draft.
 * @param {Function} onSave - Called when the user saves.
 * @param {Function} onCancel - Called when the user cancels.
 * @param {boolean} [isSaving] - Disables the actions while a save is in flight.
 */
function RegulationForm({ draft, onChange, onSave, onCancel, isSaving = false }) {

    /**
     * Replaces one field on the draft.
     * @param {string} field - Field name.
     * @param {any} value - The new value.
     */
    const update = (field, value) => {
        onChange({ ...draft, [field]: value });
    };

    return (
        <div className="reg-form">
            <div className="reg-field-grid">
                <label className="reg-field">
                    <span className="reg-field-label">Minimum size (cm)</span>
                    <input
                        className="reg-input"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="—"
                        value={draft.minimumSizeCm ?? ''}
                        onChange={(e) => update('minimumSizeCm', toNumberOrNull(e.target.value))}
                    />
                </label>

                <label className="reg-field">
                    <span className="reg-field-label">Maximum size (cm)</span>
                    <input
                        className="reg-input"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="—"
                        value={draft.maximumSizeCm ?? ''}
                        onChange={(e) => update('maximumSizeCm', toNumberOrNull(e.target.value))}
                    />
                </label>

                <label className="reg-field">
                    <span className="reg-field-label">Bag limit</span>
                    <input
                        className="reg-input"
                        type="number"
                        min="0"
                        placeholder="—"
                        value={draft.bagLimit ?? ''}
                        onChange={(e) => update('bagLimit', toNumberOrNull(e.target.value))}
                    />
                </label>

                <label className="reg-field">
                    <span className="reg-field-label">Counted per</span>
                    <select
                        className="reg-input"
                        disabled={draft.bagLimit == null}
                        value={draft.bagLimitBasis ?? ''}
                        onChange={(e) => update('bagLimitBasis', e.target.value || null)}>
                        <option value="">Not specified</option>
                        {Object.entries(BAG_LIMIT_BASIS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label.replace('per ', '')}</option>
                        ))}
                    </select>
                    {draft.bagLimit != null && !draft.bagLimitBasis && (
                        <span className="reg-field-hint">Without this the limit shows as a bare number.</span>
                    )}
                </label>
            </div>

            <div className="reg-toggles">
                <label className="reg-check">
                    <input
                        type="checkbox"
                        checked={draft.isCatchAndReleaseOnly}
                        onChange={(e) => update('isCatchAndReleaseOnly', e.target.checked)}
                    />
                    <span>Catch and release only</span>
                </label>
                <label className="reg-check">
                    <input
                        type="checkbox"
                        checked={draft.mustReportCatch}
                        onChange={(e) => update('mustReportCatch', e.target.checked)}
                    />
                    <span>Catch must be reported</span>
                </label>
            </div>

            <PeriodEditor
                periods={draft.protectedPeriods ?? []}
                onChange={(periods) => update('protectedPeriods', periods)}
            />

            <label className="reg-field">
                <span className="reg-field-label">Additional rules</span>
                <textarea
                    className="reg-textarea"
                    rows={3}
                    maxLength={5000}
                    placeholder="Gear restrictions, access limits, anything else specific to this water…"
                    value={draft.additionalRules ?? ''}
                    onChange={(e) => update('additionalRules', e.target.value || null)}
                />
            </label>

            <div className="reg-form-actions">
                <button type="button" className="button button-primary" disabled={isSaving} onClick={onSave}>
                    {isSaving ? 'Saving…' : 'Save rule'}
                </button>
                <button type="button" className="reg-action is-quiet" disabled={isSaving} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default RegulationForm;
