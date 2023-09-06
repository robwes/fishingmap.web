import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
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

    const getButtons = (isDisabled) => {
        if (!permit) {
            return <ButtonSuccess type="submit" disabled={isDisabled}>Add</ButtonSuccess>;
        } else {
            return <>
                <ButtonSecondary onClick={onDelete} disabled={isDisabled}>Delete</ButtonSecondary>
                <ButtonSuccess type="submit" disabled={isDisabled}>Save</ButtonSuccess>
            </>;
        }
    }

    return (
        <Formik
            initialValues={getInitialValues()}
            validationSchema={formValidation}
            onSubmit={onSubmit}>
            {({ isSubmitting }) => (
                <Form className="permit-form">
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
                            disabled={isSubmitting}
                        />
                        <Input
                            label="Url"
                            name="url"
                            type="text"
                            disabled={isSubmitting}
                        />
                        <ButtonBar>
                            {getButtons(isSubmitting)}
                        </ButtonBar>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default PermitForm