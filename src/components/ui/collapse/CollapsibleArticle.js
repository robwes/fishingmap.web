import React from 'react';
import CollapsibleParagraph from './CollapsibleParagraph';
import './CollapsibleArticle.scss';

function CollapsibleArticle({ className, title, ...props }) {

    const getCssClasses = () => {
        let cssClasses = "collapsible-article";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <div className={getCssClasses()}>
            <CollapsibleParagraph
                label={title}
                {...props}
            />
        </div>
    )
}

export default CollapsibleArticle