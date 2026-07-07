import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ViewToggle.scss';

/**
 * Segmented Map/List switch that links between the map and the locations
 * list, carrying the filters both pages share (free-text `q` and species
 * `sIds`) across so an active search survives the switch. Distance is
 * deliberately not carried: the two pages define it differently — distance
 * from the user on the list, a draggable radius circle on the map.
 * @param {Object} props
 * @param {'map'|'list'} props.active - Which view is currently shown.
 */
function ViewToggle({ active }) {
    const [searchParams] = useSearchParams();

    // Rebuild the query string from only the shared filter params, using the
    // same names both pages read.
    const carried = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) {
        carried.set('q', query);
    }
    searchParams.getAll('sIds').forEach(id => carried.append('sIds', id));

    const suffix = carried.toString() ? `?${carried}` : '';

    return (
        <div className="view-toggle" role="group" aria-label="Switch between map and list view">
            <Link
                to={`/map${suffix}`}
                className={active === 'map' ? 'active' : ''}
                aria-current={active === 'map' ? 'page' : undefined}>
                <i className="fas fa-map-marker-alt" aria-hidden="true" /> Map
            </Link>
            <Link
                to={`/locations${suffix}`}
                className={active === 'list' ? 'active' : ''}
                aria-current={active === 'list' ? 'page' : undefined}>
                <i className="fas fa-list-ul" aria-hidden="true" /> List
            </Link>
        </div>
    );
}

export default ViewToggle;
