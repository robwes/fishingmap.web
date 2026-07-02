import React, { useEffect, useState } from 'react';
import './RangeInput.scss';

// Keys that move a range input's thumb; a keyup on any of these counts as
// "the user finished an adjustment" and triggers a commit.
const SLIDER_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

/**
 * Plain controlled range slider for auto-applying filter toolbars (no Formik).
 * Tracks the dragged position in local state so the UI stays responsive; when
 * `onCommit` is supplied it fires only when an adjustment finishes —
 * mouseup/touchend for pointer drags, keyup for keyboard steps — not on
 * every `onChange` tick, so callers can defer expensive work (e.g. a network
 * fetch) until the user settles on a value. Without `onCommit`, `onChange`
 * fires on every tick instead.
 * When `disabled`, the slider is inert and an optional `hint` explains why
 * (e.g. distance filtering needs location access).
 * @param {{ label?: string, value: number, onChange?: (value: number) => void, onCommit?: (value: number) => void, min?: number, max?: number, unit?: string, disabled?: boolean, hint?: string }} props
 */
function RangeInput({ label, value, onChange, onCommit, min = 0, max = 100, unit = '', disabled = false, hint }) {
    const [local, setLocal] = useState(value ?? min);

    useEffect(() => {
        setLocal(value ?? min);
    }, [value, min]);

    const handleChange = (e) => {
        const v = Number(e.target.value);
        setLocal(v);
        if (!onCommit) {
            onChange?.(v);
        }
    };

    const handleCommit = (e) => {
        onCommit?.(Number(e.target.value));
    };

    /**
     * Commits keyboard adjustments so the slider is usable without a
     * pointer — mouseup/touchend never fire for arrow-key changes.
     * @param {React.KeyboardEvent<HTMLInputElement>} e
     */
    const handleKeyUp = (e) => {
        if (SLIDER_KEYS.includes(e.key)) {
            handleCommit(e);
        }
    };

    return (
        <div className={`range-input${disabled ? ' is-disabled' : ''}`}>
            {label && <label>{label}</label>}
            <input
                type="range"
                min={min}
                max={max}
                value={local}
                disabled={disabled}
                onChange={handleChange}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                onKeyUp={handleKeyUp}
            />
            <div className="range-input-value">
                {local === 0 ? <i className="fas fa-infinity" /> : `${local}${unit ? ` ${unit}` : ''}`}
            </div>
            {hint && <div className="range-input-hint">{hint}</div>}
        </div>
    );
}

export default RangeInput;
