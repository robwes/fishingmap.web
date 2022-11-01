import React, { useState } from 'react';
import './common.css';

function Collapse({ children, label, open = false }) {

    const [isOpen, setIsOpen] = useState(open);

    const getButtonIcon = () => {
        let cssClasses = "fas ";

        cssClasses += isOpen ? "fa-minus" : "fa-plus";

        return cssClasses;
    }

    const getCollapseCssClasses = () => {
        let cssClasses = "collapse";

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
        <div className={getCollapseCssClasses()}>
            <div className="collapse-header">
                <button className="button-collapse" onClick={toggleOpen}>
                    <i className={getButtonIcon()}></i>
                </button>
                <label className="label-collapse">{label}</label>
            </div>
            <div className="collapse-body">
                {children}
            </div>
        </div>
    )
}

export default Collapse;
