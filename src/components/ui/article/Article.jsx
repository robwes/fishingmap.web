import React from 'react';
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
            {text}
        </p>
    </div>
    )
}

export default Article
