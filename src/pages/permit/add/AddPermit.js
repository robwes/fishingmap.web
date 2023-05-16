import React from 'react';
import { useNavigate } from 'react-router-dom';
import { permitService } from '../../../services/permitService';
import PermitForm from '../../../components/ui/permit/PermitForm';
import './AddPermit.scss';

function AddPermit() {

    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting }) => {
        var response = await permitService.createPermit({
            name: values.name,
            url: values.url
        });

        if (response) {
            navigate(`/permits/${response.id}`);
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