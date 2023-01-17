import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup';
import Input from '../common/form/Input'
import Form from '../common/form/Form'
import authService from '../../services/authService'
import userService from '../../services/userService'
import Collapse from '../common/Collapse'
import './users.scss';

const userDetailsValidation = Yup.object({
    firstName: Yup.string()
        .max(30, "Max 30 characters")
        .required("Required"),
    lastName: Yup.string()
        .max(30, "Max 30 characters")
        .required("Required"),
    email: Yup.string()
        .max(100, "Max 100 characters")
        .required("Required")
        .email()
});

const userPasswordValidation = Yup.object({
    currentPassword: Yup.string()
        .required("Password is required")
        .min(5, "Must be at leeat 7 characters")
        .max(100, "Max 100 characters"),
    newPassword: Yup.string()
        .required("New password is required")
        .min(5, "Must be at leeat 7 characters")
        .max(100, "Max 100 characters"),
    confirmPassword: Yup.string()
        .required("Please confirm your new password")
        .min(5, "Must be at leeat 7 characters")
        .max(100, "Max 100 characters")
        .oneOf([Yup.ref('newPassword')], 'Your passwords do not match.')
});

function EditUser() {

    const { id } = useParams();
    const [user, setUser] = useState();

    useEffect(() => {
        (async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
        })();
    }, [])

    const handleUserDetailsSubmit = async (values, actions) => {
        const userDetails = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email
        };

        const updatedUser = await userService.updateUserDetails(id, userDetails);
        if (updatedUser) {
            setUser(updatedUser);
        } else {
            actions.resetForm();
        }
    };

    const handleUserPasswordSubmit = async (values, actions) => {
        const userPasswordUpdate = {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
        };

        const result = await userService.updateUserPassword(id, userPasswordUpdate);
        if (result) {
            actions.resetForm();
        }
    };

    return (
        user ? (<div className='edit-user'>
            <div className='container edit-user-container'>
                <div className='user-form'>
                    <div className='user-avatar left'>
                        <i className='fa fa-user-circle-o'></i>
                        <span className='user-tag'>{user?.userName}</span>
                    </div>
                    <div className='right'>
                        <div className='form-card user-info'>
                            <Form
                                initialValues={{
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email
                                }}
                                validationSchema={userDetailsValidation}
                                onSubmit={handleUserDetailsSubmit}
                                >
                                <div className='user-details-form'>
                                    <Input
                                        label="First name"
                                        name="firstName"
                                        type="text"
                                    />
                                    <Input
                                        label="Last name"
                                        name="lastName"
                                        type="text"
                                    />
                                    <Input
                                        label="Email"
                                        name="email"
                                        type="email"
                                    />
                                </div>
                                <button className="button button-secondary" type="submit">Update</button>
                            </Form>
                        </div>

                        <div className='form-card user-password'>
                            <Collapse label="Change password">
                                <Form
                                    initialValues={{
                                        currentPassword: "",
                                        newPassword: "",
                                        confirmPassword: ""
                                    }}
                                    validationSchema={userPasswordValidation}
                                    onSubmit={handleUserPasswordSubmit}>
                                    <div className='user-password-form'>
                                        <Input
                                            label="Password"
                                            name="currentPassword"
                                            type="password"
                                        />
                                        <Input
                                            label="New password"
                                            name="newPassword"
                                            type="password"
                                        />
                                        <Input
                                            label="Confirm password"
                                            name="confirmPassword"
                                            type="password"                                         
                                        />
                                    </div>
                                    <button className="button button-secondary" type="submit">Change password</button>
                                </Form>
                            </Collapse>
                        </div>
                    </div>
                </div>
            </div>
        </div >) : <></>
    )
}

export default EditUser