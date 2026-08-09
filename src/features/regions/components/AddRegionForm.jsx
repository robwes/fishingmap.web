import React, { useState } from 'react';
import { REGION_CHILD_TYPE } from '@/shared/constants/regulations';
import { getRegionTypeLabel } from '@/shared/utils/regulationUtils';
import '@/shared/components/regulations/regulationFields.scss';
import './AddRegionForm.scss';

/**
 * Adds a region one tier below the selected one.
 *
 * The child's tier comes from a name lookup, never from arithmetic on the
 * parent's: `type` is the backend enum's name, not a number.
 * @param {Object} parentRegion - The region the new one goes under.
 * @param {Function} onAdd - Called with { name, type, parentRegionId }.
 * @param {boolean} [isSaving] - Disables the form while a save is in flight.
 */
function AddRegionForm({ parentRegion, onAdd, isSaving = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');

    const childType = REGION_CHILD_TYPE[parentRegion.type];
    const childTypeLabel = getRegionTypeLabel(childType);

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            return;
        }

        onAdd({ name: trimmed, type: childType, parentRegionId: parentRegion.id });
        setName('');
        setIsOpen(false);
    };

    // A tier with nowhere below it can't take children.
    if (!childType) {
        return null;
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                className="reg-action is-quiet region-add-button"
                onClick={() => setIsOpen(true)}>
                <i className="fa-solid fa-plus"></i>Add region under {parentRegion.name}
            </button>
        )
    }

    return (
        <div className="region-add-row">
            <input
                className="reg-input"
                autoFocus
                value={name}
                placeholder={`New ${childTypeLabel?.toLowerCase() ?? 'region'}…`}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <div className="reg-form-actions">
                <button type="button" className="button button-primary" disabled={isSaving} onClick={submit}>
                    Add
                </button>
                <button
                    type="button"
                    className="reg-action is-quiet"
                    onClick={() => { setIsOpen(false); setName(''); }}>
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default AddRegionForm;
