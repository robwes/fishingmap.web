import React from 'react';
import { getRegionTypeLabel } from '@/shared/utils/regulationUtils';
import { REGION_TYPE } from '@/shared/constants/regulations';
import './RegionTree.scss';

const TIER_ICONS = {
    [REGION_TYPE.ROOT]: 'fa-flag',
    [REGION_TYPE.ELY]: 'fa-sitemap',
    [REGION_TYPE.MANAGEMENT_AREA]: 'fa-water',
};

/**
 * One region and everything beneath it. Rendered as a flat list of buttons
 * indented by depth rather than nested lists, so the whole tree stays one
 * keyboard tab sequence.
 * @param {Array<Object>} regions - Every region.
 * @param {Object} region - The region this node renders.
 * @param {number|null} selectedId - The currently selected region id.
 * @param {Function} onSelect - Called with a region id.
 * @param {number} [depth] - Nesting depth, used for the indent.
 */
function RegionTreeNode({ regions, region, selectedId, onSelect, depth = 0 }) {
    const children = regions.filter(r => r.parentRegionId === region.id);
    const icon = TIER_ICONS[region.type] ?? 'fa-location-dot';

    return (
        <>
            <li>
                <button
                    type="button"
                    className={`region-tree-item${selectedId === region.id ? ' is-selected' : ''}`}
                    style={{ paddingLeft: `${0.9 + depth * 1.1}em` }}
                    onClick={() => onSelect(region.id)}>
                    <i className={`fa-solid ${icon} region-tree-icon`}></i>
                    <span className="region-tree-name">{region.name}</span>
                    <span className="region-tree-type">{getRegionTypeLabel(region.type)}</span>
                </button>
            </li>
            {children.map(child => (
                <RegionTreeNode
                    key={child.id}
                    regions={regions}
                    region={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    depth={depth + 1}
                />
            ))}
        </>
    )
}

/**
 * The region hierarchy, rooted at the National region.
 *
 * Roots are found by having no parent rather than by tier, so a region whose
 * parent was removed still appears instead of vanishing from the only screen
 * that could fix it.
 * @param {Array<Object>} regions - Every region.
 * @param {number|null} selectedId - The currently selected region id.
 * @param {Function} onSelect - Called with a region id.
 */
function RegionTree({ regions, selectedId, onSelect }) {
    const roots = regions.filter(r => r.parentRegionId == null);

    return (
        <ul className="region-tree-list">
            {roots.map(root => (
                <RegionTreeNode
                    key={root.id}
                    regions={regions}
                    region={root}
                    selectedId={selectedId}
                    onSelect={onSelect}
                />
            ))}
        </ul>
    )
}

export default RegionTree;
