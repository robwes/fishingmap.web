import React, { useEffect, useRef, useState } from 'react';
import './MultiSelectInput.scss';

/**
 * Plain controlled multi-select for auto-applying filter toolbars (no Formik).
 * Renders selected values as removable chips inside the trigger and a
 * checkbox-style option menu that closes on outside click.
 * @param {{ label?: string, options: Array<{ label: string, value: any }>, value: Array<any>, onChange: (value: Array<any>) => void, placeholder?: string }} props
 */
function MultiSelectInput({ label, options, value, onChange, placeholder = 'Select…' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const toggle = (v) => {
        if (value.includes(v)) {
            onChange(value.filter((x) => x !== v));
        } else {
            onChange([...value, v]);
        }
    };

    return (
        <div className="multi-select-input" ref={ref}>
            {label && <label>{label}</label>}
            <div className={'ms-control' + (open ? ' ms-open' : '')} onClick={() => setOpen((o) => !o)}>
                <div className="ms-control-inner">
                    {value.length === 0 && <span className="ms-placeholder">{placeholder}</span>}
                    {value.map((v) => {
                        const opt = options.find((o) => o.value === v);
                        return (
                            <span key={v} className="ms-tag" onClick={(e) => { e.stopPropagation(); toggle(v); }}>
                                {opt ? opt.label : v}
                                <i className="fas fa-xmark" />
                            </span>
                        );
                    })}
                </div>
                <i className={'fas fa-chevron-' + (open ? 'up' : 'down') + ' ms-chevron'} />
            </div>
            {open && (
                <div className="ms-menu" onClick={(e) => e.stopPropagation()}>
                    {options.length === 0 && <div className="ms-none">No options</div>}
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={'ms-option' + (value.includes(opt.value) ? ' selected' : '')}
                            onClick={() => toggle(opt.value)}
                        >
                            <span className="box">{value.includes(opt.value) && <i className="fas fa-check" />}</span>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MultiSelectInput;
