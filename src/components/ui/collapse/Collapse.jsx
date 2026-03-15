import React, { useState } from 'react';
import './Collapse.scss';

function Collapse({ children, className, label, open = false }) {

    const [isOpen, setIsOpen] = useState(open);

    const getButtonIcon = () => {
        let cssClasses = "fas ";

        cssClasses += isOpen ? "fa-minus" : "fa-plus";

        return cssClasses;
    }

    const getCssClasses = () => {
        let cssClasses = "collapse";

        if (className) {
            cssClasses += ` ${className}`;
        }

        if (isOpen) {
            cssClasses += " open";
        }

        return cssClasses;
    }

    const toggleOpen = (ev) => {
        ev.preventDefault();
        setIsOpen(!isOpen);
    }

    return (
        <div className={getCssClasses()}>
            <div className="collapse-header">
                <button className="collapse-toggle" onClick={toggleOpen}>
                    <i className={getButtonIcon()}></i>
                </button>
                <label className="collapse-label">{label}</label>
            </div>
            <div className="collapse-body">
                {children}
            </div>
        </div>
    )
}

export default Collapse;
