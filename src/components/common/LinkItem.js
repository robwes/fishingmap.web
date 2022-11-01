import React from 'react';
import { Link } from 'react-router-dom'
import './common.css';

function LinkItem({ icon, text, path, isLink = true }) {

    return isLink ? (
        <Link to={path}>
            <div className="link-item">
                {icon && <i className={`link-item-icon ${icon}`}></i>}
                {text}
            </div>
        </Link>
    ) : (
        <div className="link-item">
            {icon && <i className={`link-item-icon ${icon}`}></i>}
            {text}
        </div>
    )
}

export default LinkItem;
