import React, { useEffect, useRef, useState } from 'react';
import { useFormikContext } from 'formik';
import { VALID_IMAGE_TYPES, IMAGE_ACCEPT } from '@/shared/constants/images';
import './StepPhotos.scss';

const MAX = 5;

function StepPhotos() {
    const { values, setFieldValue } = useFormikContext();
    const [previews, setPreviews] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef();

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

    const atMax = (values.images?.length ?? 0) >= MAX;

    const addFiles = (files) => {
        const valid = Array.from(files).filter(f => VALID_IMAGE_TYPES.includes(f.type));
        const slots = MAX - (values.images?.length ?? 0);
        const toAdd = valid.slice(0, slots);
        if (!toAdd.length) {
            return;
        }

        setFieldValue('images', [...(values.images ?? []), ...toAdd]);
        setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    };

    const removeAt = (index) => {
        URL.revokeObjectURL(previews[index]);
        setFieldValue('images', (values.images ?? []).filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="wizard-step-panel">
            <div>
                <h2 className="ws-panel-title">Photos</h2>
                <p className="ws-panel-desc">
                    Add photos to help others recognise the spot and find their way around.
                </p>
            </div>
            <div className="ws-fields">
                <div className="ws-photos-label">
                    <span>Photos</span>
                    <small> — up to {MAX} images</small>
                </div>

                <div className="ws-photo-grid">
                    {previews.map((url, i) => (
                        <div key={i} className="ws-photo-thumb">
                            <img src={url} alt="" />
                            <button
                                type="button"
                                className="ws-photo-remove"
                                onClick={() => removeAt(i)}
                                title="Remove"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>
                    ))}

                    {!atMax && (
                        <div
                            className={`ws-photo-add${isDragOver ? ' drag-over' : ''}`}
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={(e) => {
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

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                />
            </div>
        </div>
    );
}

export default StepPhotos;
