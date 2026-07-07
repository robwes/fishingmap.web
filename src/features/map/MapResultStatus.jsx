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
 */
function MapResultStatus({ count, show, hasActiveFilters, onReset }) {
    if (!show) {
        return null;
    }

    if (count === 0) {
        return (
            <div className="map-result-status is-empty">
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
        <div className="map-result-status">
            <b>{count}</b> {count === 1 ? 'location' : 'locations'}
        </div>
    );
}

export default MapResultStatus;
