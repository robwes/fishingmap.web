import React from 'react';
import './ArticleInput.scss';
import TextArea from './TextArea';

function ArticleInput({ label, className, ...props }) {

    const getCssClasses = () => {
        let cssClasses = "article-input";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <div className={getCssClasses()}>
            <h3 className='article-input-label'>{label}</h3>
            <TextArea
                className='article-input-label'
                {...props}
            />
        </div>
    )
}

export default ArticleInput