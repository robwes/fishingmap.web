import React from 'react';
import Card from './Card';
import './InlineCard.scss';

function InlineCard({children, className}) {

    const getCssClasses = () => {
        let cssClasses = "inline-card";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <Card className={getCssClasses()}>
            {children}
        </Card>
    )
}

export default InlineCard