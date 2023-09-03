import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/card/Card';
import permitImage from '../../../assets/images/permit.png';
import './PermitListItem.scss';

function PermitListItem({ permit }) {
    const { id, name } = permit;
    return (
        <Link to={`/permits/${id}`}>
            <Card className='permit-list-item'>
                <img
                    className='permit-list-item-image'
                    src={permitImage}
                    alt="Permit icon"
                />
                <div className='permit-list-item-body'>
                    <h3 title={name} className='permit-list-item-title'>{name}</h3>
                </div>
            </Card>
        </Link>
    )
}

export default PermitListItem