import React from 'react'
import Collapse from './Collapse'

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