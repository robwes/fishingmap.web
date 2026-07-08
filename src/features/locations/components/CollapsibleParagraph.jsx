import React from 'react';
import Collapse from '@/shared/components/collapse/Collapse';
import './CollapsibleParagraph.scss';

function CollapsibleParagraph({ text, ...props }) {
    return (
        <Collapse {...props}>
            <p className='collapsible-paragraph'>
                {text}
            </p>
        </Collapse>
    )
}

export default CollapsibleParagraph
