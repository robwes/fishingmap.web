import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { permitService } from '../../../services/permitService';
import PermitCard from './PermitCard';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import './PermitDetails.scss';

function PermitDetails() {

    const { id } = useParams();
    const [permit, setPermit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermitById(parseInt(id));
            if (p) {
                setPermit(p);
            }
            setIsLoading(false);
        })();
    }, [id])

    return (
        <div className='permit-details page'>
            {isLoading && <FloatingSpinner />}

            <div className='container center-content'>
                {permit && <PermitCard permit={permit} />}
            </div>
        </div>
    )
}

export default PermitDetails