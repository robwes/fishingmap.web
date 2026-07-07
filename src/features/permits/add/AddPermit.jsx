import React from 'react';
import { useNavigate } from 'react-router-dom';
import { permitService } from '@/shared/services/permitService';
import PermitForm from '@/features/permits/components/PermitForm';
import { useToast } from '@/shared/context/ToastContext';
import './AddPermit.scss';

function AddPermit() {

    const navigate = useNavigate();
    const showToast = useToast();

    /**
     * Creates the permit and navigates to it, or shows an error toast when
     * the request was rejected.
     * @param {{name: string, url: string}} values - The submitted form values.
     */
    const handleSubmit = async (values) => {
        const response = await permitService.createPermit({
            name: values.name,
            url: values.url
        });

        if (response) {
            navigate(`/permits/${response.id}`);
        } else {
            showToast('Failed to add the permit. Please try again.');
        }
    }

    return (
        <div className='add-permit'>
            <div className='container center-content'>
                <div className='add-permit-body'>
                    <h1 className="page-title">Add permit</h1>
                    <PermitForm onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    )
}

export default AddPermit
