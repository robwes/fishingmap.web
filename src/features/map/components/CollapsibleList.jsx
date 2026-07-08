import React, { useState, useRef, useEffect } from 'react';
import './CollapsibleList.scss';

/**
 * A list that collapses to a single row with a toggle to expand it.
 * @param {string} className - Extra class for the outer container.
 * @param {string} listClassName - Extra class for the inner list element.
 * @param {string} label - Optional heading rendered above the list.
 * @param {string} closedLabel - Text shown on the toggle while collapsed (e.g. "Show all 8 species").
 * @param {string} openLabel - Text shown on the toggle while expanded (e.g. "Show fewer").
 * @param {boolean} open - Whether the list starts expanded.
 */
function CollapsibleList({ className, listClassName, label, closedLabel, openLabel, children, open = false, ...props }) {
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

    const toggleLabel = isOpen ? openLabel : closedLabel;

    return (
        // The whole container toggles (bigger touch target on mobile); the
        // button inside has no handler of its own — its clicks, including
        // keyboard-triggered ones, bubble up here.
        <div
            className={`collapsible-list-container${className ? ` ${className}` : ''}${isOpen ? ' open' : ''}${needsToggle ? ' is-toggleable' : ''}`}
            onClick={needsToggle ? toggleOpen : undefined}
            {...props}
        >
            {label && (
                <div className="collapsible-list-label">{label}</div>
            )}
            <div className={`collapsible-list-body ${isOpen ? 'open' : ''}`} ref={contentRef}>
                <div className={`collapsible-list${listClassName ? ` ${listClassName}` : ''}`}>
                    {children}
                </div>
            </div>
            {needsToggle && (
                <button className={`collapsible-list-toggle${toggleLabel ? ' has-label' : ''}`} aria-expanded={isOpen}>
                    {toggleLabel && (
                        <span className="collapsible-list-toggle-label">{toggleLabel}</span>
                    )}
                    <i className={`fas fa-chevron-down collapsible-list-icon ${isOpen ? 'open' : ''}`}></i>
                </button>
            )}
        </div>
    )
}

export default CollapsibleList;