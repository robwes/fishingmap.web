import React, { useState } from 'react';
import './SlideInPanel.scss';

function SlideInPanel({ iconOpen = "fa-search", iconClose = "fa-times", isFloating = false, children }) {

    const [ isOpen, setIsOpen ] = useState(false);

    const getPanelCssClasses = () => {
        let classes = "slide-in-panel ";

        classes += isFloating ? "floating" : "default";

        if (isOpen) {
            classes += " open";
        }

        return classes;
    } 

    const getButtonIcon = () => {
        let icon = "fas ";
        icon += isOpen ? iconClose : iconOpen
        
        return icon; 
    }

    return (
        <div className={getPanelCssClasses()}>
            <button className="slide-toggle" onClick={() => setIsOpen(!isOpen)}>
                <i className={getButtonIcon()}></i>
            </button>
            {children}
        </div>
    )
}

export default SlideInPanel
