import React from 'react';
import './CardTitle.scss';

function CardTitle({children}) {
    return (
        <h3 className='card-title'>
            {children}
        </h3>
    )
}

export default CardTitle