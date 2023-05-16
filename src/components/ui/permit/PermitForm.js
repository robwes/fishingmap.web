import React from 'react';
import * as Yup from 'yup';
import Form from '../form/Form';
import Input from '../form/Input';
import ButtonBar from '../buttons/ButtonBar';
import ButtonSecondary from '../buttons/ButtonSecondary';
import ButtonSuccess from '../buttons/ButtonSuccess';
import permitImage from '../../../assets/images/permit.png';
import './PermitForm.scss';

const formValidation = Yup.object({
    name: Yup.string()
        .max(100, "Max 100 characters")
        .required("Required"),
    url: Yup.string()
        .url()
        .max(500, "Max 500 characters")
        .nullable()
});

function PermitForm({ permit, onSubmit, onDelete }) {

    const getInitialValues = () => {
        const initialValues = {
            name: permit ? permit.name : "",
            url: permit ? permit.url : ""
        };

        return initialValues;
    }

    const getButtons = () => {
        if (!permit) {
            return <ButtonSuccess type="submit">Add</ButtonSuccess>;
        } else {
            return <>
                <ButtonSecondary onClick={onDelete}>Delete</ButtonSecondary>
                <ButtonSuccess type="submit">Save</ButtonSuccess>
            </>;
        }
    }

    return (
        <Form
            className="permit-form"
            initialValues={getInitialValues()}
            validationSchema={formValidation}
            onSubmit={onSubmit}>
            <img
                className='permit-image'
                src={permitImage}
                alt='Permit icon'
            />
            <div className='right'>
                <Input
                    label="Name"
                    name="name"
                    type="text"
                />

                <Input
                    label="Url"
                    name="url"
                    type="text"
                />
                <ButtonBar>
                    {getButtons()}
                </ButtonBar>
            </div>
        </Form>
    )
}

export default PermitForm