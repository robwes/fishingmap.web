import React from 'react';
import Button from './Button';
import './ButtonPrimary.scss';

function ButtonPrimary({children, ...rest}) {
    return (
        <Button className="button-primary" {...rest}>
            {children}
        </Button>
    )
}

export default ButtonPrimary