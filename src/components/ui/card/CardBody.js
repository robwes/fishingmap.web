import React from 'react';
import './CardBody.scss';

function CardBody({children}) {
    return (
        <div className='card-body'>
            {children}
        </div>
    )
}

export default CardBody