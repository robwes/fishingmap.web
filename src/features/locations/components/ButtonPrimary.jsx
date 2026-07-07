import React from 'react';
import Button from '@/shared/components/buttons/Button';
import './ButtonPrimary.scss';

function ButtonPrimary({children, ...rest}) {
    return (
        <Button className="button-primary" {...rest}>
            {children}
        </Button>
    )
}

export default ButtonPrimary
