import React from 'react';
import Linkify from 'react-linkify';
import { SecureLink } from "react-secure-link";
import './Article.scss';

function Article({title, text, className}) {

    const getCssClasses = () => {
        let cssClasses = "article";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <div className={getCssClasses()}>
        <h3 className='article-title'>{title}</h3>
        <p className='article-text'>
            <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                <SecureLink href={decoratedHref} key={key}>{decoratedText}</SecureLink>
            )}>
                {text}
            </Linkify>
        </p>
    </div>
    )
}

export default Article