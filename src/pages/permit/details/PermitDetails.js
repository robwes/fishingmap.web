import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { permitService } from '../../../services/permitService';
import PermitCard from './PermitCard';
import './PermitDetails.scss';

function PermitDetails() {

    const { id } = useParams();
    const [permit, setPermit] = useState(null);

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermitById(parseInt(id));
            if (p) {
                setPermit(p);
            }
        })();
    }, [id])

    return (
        <div className='permit-details page'>
            <div className='container center-content'>
                {permit && <PermitCard permit={permit} />}
            </div>
        </div>
    )
}

export default PermitDetails