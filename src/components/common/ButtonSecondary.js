import React from 'react';
import Button from './Button';
import './ButtonSecondary.scss';

function ButtonSecondary({children, ...rest}) {
    return (
        <Button className="button-secondary" {...rest}>{children}</Button>
    )
}

export default ButtonSecondary