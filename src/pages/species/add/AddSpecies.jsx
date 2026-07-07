import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import ButtonSecondary from '@/shared/components/buttons/ButtonSecondary';
import { speciesService } from '@/shared/services/speciesService';
import { VALID_IMAGE_TYPES, IMAGE_ACCEPT } from '@/shared/constants/images';
import { useToast } from '@/shared/context/ToastContext';
import './AddSpecies.scss';

const MAX_PHOTOS = 4;

const validation = Yup.object({
    name: Yup.string().max(50, 'Max 50 characters').required('Required'),
    scientificName: Yup.string().max(100, 'Max 100 characters').nullable(),
    description: Yup.string().max(5000, 'Max 5000 characters').nullable(),
});

function AddSpecies() {
    const navigate = useNavigate();
    const showToast = useToast();
    const [previews, setPreviews] = useState([]);
    const [images, setImages] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileRef = useRef();
    const atMax = images.length >= MAX_PHOTOS;

    // Mirror previews in a ref so the unmount cleanup revokes the latest
    // object URLs, not the ones captured on mount.
    const previewsRef = useRef(previews);
    useEffect(() => {
        previewsRef.current = previews;
    }, [previews]);

    useEffect(() => {
        return () => {
            previewsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const addFiles = (files) => {
        const valid = Array.from(files).filter(f => VALID_IMAGE_TYPES.includes(f.type));
        const toAdd = valid.slice(0, MAX_PHOTOS - images.length);
        if (!toAdd.length) {
            return;
        }
        setImages(prev => [...prev, ...toAdd]);
        setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    };

    const removeAt = (i) => {
        URL.revokeObjectURL(previews[i]);
        setImages(prev => prev.filter((_, idx) => idx !== i));
        setPreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const response = await speciesService.createSpecies({
            name: values.name,
            scientificName: values.scientificName,
            description: values.description,
            images,
        });
        if (response) {
            navigate(`/species/${response.id}`);
        } else {
            showToast('Failed to add the species. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="add-species page">
            <div className="add-species-container">
                <button className="asp-back" onClick={() => navigate('/species')}>
                    <i className="fas fa-chevron-left" /> Species
                </button>
                <h1 className="asp-heading">Add species</h1>

                <Formik
                    initialValues={{ name: '', scientificName: '', description: '' }}
                    validationSchema={validation}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="asp-form">
                            <div className="asp-card">
                                <div className="asp-card-header">
                                    <h2 className="asp-card-title">Basic details</h2>
                                    <p className="asp-card-desc">
                                        Enter the species name and a description to help anglers identify it.
                                    </p>
                                </div>
                                <div className="asp-fields">
                                    <div className="asp-field">
                                        <label className="asp-label" htmlFor="name">
                                            Name <span className="asp-required">*</span>
                                        </label>
                                        <Field id="name" name="name" type="text"
                                            className="asp-input" placeholder="e.g. Pike"
                                            disabled={isSubmitting} />
                                        <ErrorMessage name="name" component="p" className="asp-error" />
                                    </div>
                                    <div className="asp-field">
                                        <label className="asp-label" htmlFor="scientificName">Scientific name</label>
                                        <Field id="scientificName" name="scientificName" type="text"
                                            className="asp-input" placeholder="e.g. Esox lucius"
                                            disabled={isSubmitting} />
                                        <ErrorMessage name="scientificName" component="p" className="asp-error" />
                                    </div>
                                    <div className="asp-field">
                                        <label className="asp-label" htmlFor="description">Description</label>
                                        <Field as="textarea" id="description" name="description"
                                            className="asp-textarea" rows={5}
                                            placeholder="Describe the species…"
                                            disabled={isSubmitting} />
                                        <ErrorMessage name="description" component="p" className="asp-error" />
                                    </div>
                                </div>
                            </div>

                            <div className="asp-card">
                                <div className="asp-card-header">
                                    <h2 className="asp-card-title">Photos</h2>
                                    <p className="asp-card-desc">
                                        Add up to {MAX_PHOTOS} photos to help anglers identify the species.
                                    </p>
                                </div>
                                <div className="asp-fields">
                                    <div className="asp-photo-grid">
                                        {previews.map((url, i) => (
                                            <div key={i} className="asp-photo-thumb">
                                                <img src={url} alt="" />
                                                <button type="button" className="asp-photo-remove"
                                                    onClick={() => removeAt(i)} title="Remove">
                                                    <i className="fas fa-times" />
                                                </button>
                                            </div>
                                        ))}
                                        {!atMax && (
                                            <div
                                                className={`asp-photo-add${isDragOver ? ' drag-over' : ''}`}
                                                onClick={() => fileRef.current.click()}
                                                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                                                onDragLeave={() => setIsDragOver(false)}
                                                onDrop={e => {
                                                    e.preventDefault();
                                                    setIsDragOver(false);
                                                    addFiles(e.dataTransfer.files);
                                                }}
                                            >
                                                <i className="fas fa-plus" />
                                                <span>Add</span>
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} multiple
                                        style={{ display: 'none' }}
                                        onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                                </div>
                            </div>

                            <div className="asp-footer">
                                <ButtonSecondary type="button" onClick={() => navigate('/species')}>
                                    Cancel
                                </ButtonSecondary>
                                <ButtonSuccess type="submit" disabled={isSubmitting}>
                                    Add species
                                </ButtonSuccess>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default AddSpecies;
