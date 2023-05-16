import React from 'react';
import permitImage from '../../../assets/images/permit.png';
import LinkButtonPrimaryOutline from '../../../components/ui/buttons/LinkButtonPrimaryOutline';
import './PermitCard.scss';

function PermitCard({ permit }) {
    return (
        <div className='permit-card'>
            <img
                className='permit-card-image'
                src={permitImage}
                alt='Permit icon'
            />
            <div className='permit-card-body'>
                <h3 className='permit-card-title'>{permit.name}</h3>
                <LinkButtonPrimaryOutline
                    href={permit.url}
                    target="_blank"
                    rel="noreferrer">
                    <i className="fa fa-info-circle"></i>&nbsp;Read more
                </LinkButtonPrimaryOutline>
            </div>
        </div>
    )
}

export default PermitCard