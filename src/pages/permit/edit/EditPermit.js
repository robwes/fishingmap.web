import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { permitService } from '../../../services/permitService';
import './EditPermit.scss';
import PermitForm from '../../../components/ui/permit/PermitForm';

function EditPermit() {

    const { id } = useParams();
    const [permit, setPermit] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermitById(parseInt(id));
            if (p) {
                setPermit(p);
            }
        })();
        // eslint-disable-next-line
    }, []);


    const handleSubmit = async (values, { setSubmitting }) => {
        var response = await permitService.updatePermit(
            permit.id,
            {
                id: permit.id,
                name: values.name,
                url: values.url
            });

        if (response) {
            navigate(`/permits/${response.id}`);
        }
    }

    const handleDelete = async ($event) => {
        $event.preventDefault();
        if (window.confirm(`Are you sure you want to delete ${permit.name}?`)) {
            await permitService.deleteSpecies(permit.id);
            navigate(`/permits`);
        }
    }

    return (
        permit ? (
            <div className='edit-permit'>
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
            </div >) : null
    )
}

export default EditPermit