import React from 'react';
import Button from './Button';
import './ButtonSuccess.scss';

function ButtonSuccess({ children, ...rest }) {
    return (
        <Button className="button-success" {...rest}>
            {children}
        </Button>
    )
}

export default ButtonSuccess