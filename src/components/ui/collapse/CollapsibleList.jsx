import React, { useState, useRef, useEffect } from 'react';
import './CollapsibleList.scss';

function CollapsibleList({ className, listClassName, label, children, open = false, ...props }) {
    const [isOpen, setIsOpen] = useState(open);
    const [needsToggle, setNeedsToggle] = useState(true); // default to true so space is reserved
    const contentRef = useRef(null);

    useEffect(() => {
        // Use a small timeout to let the InfoWindow layout settle before measuring
        const timer = setTimeout(() => {
            if (contentRef.current) {
                // Check if actual content is taller than our collapsed max-height (approx 38px)
                if (contentRef.current.scrollHeight > 45) {
                    setNeedsToggle(true);
                } else {
                    setNeedsToggle(false);
                }
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [children]);

    const toggleOpen = (ev) => {
        ev.preventDefault();
        setIsOpen(!isOpen);
    }

    return (
        <div className={`collapsible-list-container${className ? ` ${className}` : ''}${isOpen ? ' open' : ''}`} {...props}>
            {label && (
                <div className="collapsible-list-label">{label}</div>
            )}
            <div className={`collapsible-list-body ${isOpen ? 'open' : ''}`} ref={contentRef}>
                <div className={`collapsible-list${listClassName ? ` ${listClassName}` : ''}`}>
                    {children}
                </div>
            </div>
            {needsToggle && (
                <button className="collapsible-list-toggle" onClick={toggleOpen}>
                    <i className={`fas fa-chevron-down collapsible-list-icon ${isOpen ? 'open' : ''}`}></i>
                </button>
            )}
        </div>
    )
}

export default CollapsibleList;