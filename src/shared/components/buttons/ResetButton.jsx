import React from 'react';
import './ResetButton.scss';

/**
 * A subtle text-style button for clearing active filters.
 * @param {{ onClick?: () => void, type?: string, disabled?: boolean }} props
 */
function ResetButton({ onClick, type = 'button', disabled = false }) {
    return (
        <button type={type} className="reset-button" onClick={onClick} disabled={disabled}>
            <i className="fas fa-rotate-left" /> Reset
        </button>
    );
}

export default ResetButton;
