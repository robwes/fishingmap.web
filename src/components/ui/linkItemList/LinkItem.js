import React from 'react';
import { Link } from 'react-router-dom';
import { SecureLink } from "react-secure-link";
import './LinkItem.scss';

function LinkItem({ item }) {
    const { icon, text, path, url } = item;

    const linkItem = <div className="link-item">
        {icon && <i className={`link-item-icon ${icon}`}></i>}
        {text}
    </div>;
    
    if (url) {
        return (<SecureLink href={url}
            target="_blank"
            rel="noreferrer">
            {linkItem}
        </SecureLink>);
    }
    else if (path) {
        return (
            <Link to={path}>
                {linkItem}
            </Link>
        );
    } else {
        return linkItem;
    }
}

export default LinkItem;
