import React from 'react';
import Linkify from 'react-linkify';
import { SecureLink } from "react-secure-link";
import Collapse from './Collapse';
import './CollapsibleParagraph.scss';

function CollapsibleParagraph({ text, ...props }) {
    return (
        <Collapse {...props}>
            <p className='collapsible-paragraph'>
                <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                    <SecureLink href={decoratedHref} key={key}>{decoratedText}</SecureLink>
                )}>
                    {text}
                </Linkify>
            </p>
        </Collapse>
    )
}

export default CollapsibleParagraph