import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { permitService } from '@/shared/services/permitService';
import PermitForm from '@/features/permits/components/PermitForm';
import FloatingSpinner from '@/shared/components/spinner/FloatingSpinner';
import { useToast } from '@/shared/context/ToastContext';
import './EditPermit.scss';

function EditPermit() {

    const { id } = useParams();
    const [permit, setPermit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const showToast = useToast();

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermitById(parseInt(id));
            if (p) {
                setPermit(p);
            }
            setIsLoading(false);
        })();
        // eslint-disable-next-line
    }, []);


    /**
     * Saves the permit and navigates back to it, or shows an error toast
     * when the request was rejected.
     * @param {{name: string, url: string}} values - The submitted form values.
     */
    const handleSubmit = async (values) => {
        const response = await permitService.updatePermit(
            permit.id,
            {
                id: permit.id,
                name: values.name,
                url: values.url
            });

        if (response) {
            navigate(`/permits/${response.id}`);
        } else {
            showToast('Failed to save the permit. Please try again.');
        }
    }

    /**
     * Deletes the permit after confirmation. Only navigates away when the
     * server actually confirmed the delete.
     * @param {React.MouseEvent} $event
     */
    const handleDelete = async ($event) => {
        $event.preventDefault();
        if (window.confirm(`Are you sure you want to delete ${permit.name}?`)) {
            const deleted = await permitService.deletePermit(permit.id);
            if (deleted) {
                navigate(`/permits`);
            } else {
                showToast('Failed to delete the permit. Please try again.');
            }
        }
    }

    return (
        <div className='edit-permit'>
            {isLoading && <FloatingSpinner />}

            {permit && (
                <div className='container center-content'>
                    <div className='edit-permit-body'>
                        <h1 className="page-title">Edit permit</h1>
                        <PermitForm
                            permit={permit}
                            onSubmit={handleSubmit}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default EditPermit
