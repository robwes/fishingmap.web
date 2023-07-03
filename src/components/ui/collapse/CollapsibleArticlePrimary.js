import React from 'react';
import CollapsibleArticle from './CollapsibleArticle';
import './CollapsibleArticlePrimary.scss';

function CollapsibleArticlePrimary({ className, ...props }) {

    const getCssClasses = () => {
        let cssClasses = "collapsible-article-primary";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <CollapsibleArticle
            className={getCssClasses()}
            {...props}
        />
    )
}

export default CollapsibleArticlePrimary