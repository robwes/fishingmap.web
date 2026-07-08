import React from 'react';
import './MapResultStatus.scss';

/**
 * Floating status shown over the map so filtering has visible feedback: a
 * count while results exist, and an explicit empty state (with a reset) when
 * a filtered search matches nothing — so "no results" is distinguishable
 * from "still loading". Renders nothing until the first results resolve.
 * @param {Object} props
 * @param {number} props.count - Number of matching locations.
 * @param {boolean} props.show - Whether results have resolved at least once.
 * @param {boolean} props.hasActiveFilters - Whether any filter is applied.
 * @param {() => void} props.onReset - Clears all active filters.
 * @param {'pill'|'inline'} [props.variant] - 'pill' floats over the map;
 * 'inline' is plain text matching the count on the Locations/Species pages.
 */
function MapResultStatus({ count, show, hasActiveFilters, onReset, variant = 'pill' }) {
    if (!show) {
        return null;
    }

    const baseClass = `map-result-status${variant === 'inline' ? ' is-inline' : ''}`;

    if (count === 0) {
        return (
            <div className={`${baseClass} is-empty`}>
                {hasActiveFilters ? (
                    <>
                        <span>No locations match your filters.</span>
                        <button type="button" onClick={onReset}>Reset</button>
                    </>
                ) : (
                    <span>No locations to show.</span>
                )}
            </div>
        );
    }

    return (
        <div className={baseClass}>
            <b>{count}</b> {count === 1 ? 'location' : 'locations'}
        </div>
    );
}

export default MapResultStatus;
