import React, { useState, useEffect, useRef } from 'react';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import { fileService } from '@/shared/services/fileService';
import { VALID_IMAGE_TYPES, IMAGE_ACCEPT } from '@/shared/constants/images';
import './MediaManagerPanel.scss';

/**
 * Shared staged image manager for the edit pages (locations, species).
 * Existing images render straight from the images endpoint — no blob
 * downloads. Deletes and uploads are staged locally and only committed to
 * the server when the user clicks Save (with a confirmation when deletes
 * are involved); afterwards the entity is refetched so the grid reflects
 * server-confirmed state.
 * @param {{
 *   images: Array<{id: number, name: string, path: string}>,
 *   maxImages?: number,
 *   addImage: (file: File) => Promise<Object|null>,
 *   removeImage: (imageId: number) => Promise<boolean>,
 *   refetch: () => Promise<Object|null>,
 *   onSaved: (entity: Object) => void
 * }} props - `addImage`/`removeImage`/`refetch` wrap the owning entity's
 *   service calls; `onSaved` receives the refetched entity.
 */
function MediaManagerPanel({ images, maxImages = 5, addImage, removeImage, refetch, onSaved }) {
    const [pendingDeletes, setPendingDeletes] = useState(new Set());
    const [pendingUploads, setPendingUploads] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const fileInputRef = useRef();

    // Mirror pendingUploads in a ref so the unmount cleanup revokes the
    // latest object URLs, not the ones captured on mount.
    const uploadsRef = useRef(pendingUploads);
    useEffect(() => {
        uploadsRef.current = pendingUploads;
    }, [pendingUploads]);

    useEffect(() => {
        return () => {
            uploadsRef.current.forEach(upload => URL.revokeObjectURL(upload.previewUrl));
        };
    }, []);

    const existingImages = images ?? [];
    const keptCount = existingImages.length - pendingDeletes.size;
    const totalCount = keptCount + pendingUploads.length;
    const atMax = totalCount >= maxImages;

    /**
     * Marks an existing image for deletion. The image is not deleted from
     * the server until Save is clicked and the user confirms.
     * @param {number} imageId - The id of the image to mark for deletion.
     */
    const handleMarkDelete = (imageId) => {
        setPendingDeletes(prev => new Set([...prev, imageId]));
    };

    /**
     * Removes an image from the pending-delete set, restoring it to its normal state.
     * @param {number} imageId - The id of the image to unmark.
     */
    const handleUnmarkDelete = (imageId) => {
        setPendingDeletes(prev => {
            const next = new Set(prev);
            next.delete(imageId);
            return next;
        });
    };

    /**
     * Validates and queues files for upload, up to the remaining available
     * slots, creating a preview object URL per file.
     * @param {FileList} files - The files selected by the user or dropped onto the add cell.
     */
    const addFiles = (files) => {
        const valid = Array.from(files).filter(f => VALID_IMAGE_TYPES.includes(f.type));
        const slots = maxImages - totalCount;
        const toAdd = valid.slice(0, slots);
        if (!toAdd.length) {
            return;
        }
        setPendingUploads(prev => [
            ...prev,
            ...toAdd.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
        ]);
    };

    /**
     * Removes a queued upload before it has been saved and revokes its
     * preview object URL.
     * @param {number} index - The index of the pending upload to remove.
     */
    const removeUpload = (index) => {
        URL.revokeObjectURL(pendingUploads[index].previewUrl);
        setPendingUploads(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Handles a file drop onto the add cell.
     * @param {React.DragEvent} e
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!atMax) {
            addFiles(e.dataTransfer.files);
        }
    };

    /**
     * Commits all pending deletes and uploads to the server in sequence,
     * then refetches the entity so the parent and grid reflect the
     * server-confirmed state. Asks for confirmation before deleting images.
     * Shows an error when any individual operation or the refetch fails.
     */
    const handleSave = async () => {
        if (pendingDeletes.size > 0) {
            const count = pendingDeletes.size;
            const noun = count === 1 ? 'image' : 'images';
            if (!window.confirm(`Delete ${count} ${noun}? This cannot be undone.`)) {
                return;
            }
        }

        setIsSaving(true);
        setSaveError(false);

        let anyFailed = false;

        for (const imageId of pendingDeletes) {
            const removed = await removeImage(imageId);
            if (!removed) {
                anyFailed = true;
            }
        }

        for (const upload of pendingUploads) {
            const dto = await addImage(upload.file);
            if (!dto) {
                anyFailed = true;
            }
        }

        const updated = await refetch();

        if (updated?.id) {
            onSaved(updated);
            pendingUploads.forEach(upload => URL.revokeObjectURL(upload.previewUrl));
            setPendingDeletes(new Set());
            setPendingUploads([]);
        }

        if (updated?.id && !anyFailed) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } else {
            setSaveError(true);
            setTimeout(() => setSaveError(false), 3000);
        }

        setIsSaving(false);
    };

    const hasPendingChanges = pendingDeletes.size > 0 || pendingUploads.length > 0;

    return (
        <div className="media-manager-panel">
            <div className="edit-media-grid">
                {existingImages.map(img => (
                    <div
                        key={img.id}
                        className={`edit-media-thumb${pendingDeletes.has(img.id) ? ' pending-delete' : ''}`}
                    >
                        <img src={fileService.getImageUrl(img.path)} alt={img.name} loading="lazy" />
                        {pendingDeletes.has(img.id) ? (
                            <>
                                <div className="edit-media-delete-overlay">
                                    <i className="fas fa-trash" />
                                </div>
                                <button
                                    type="button"
                                    className="edit-media-undo"
                                    onClick={() => handleUnmarkDelete(img.id)}
                                    title="Undo removal"
                                    disabled={isSaving}
                                >
                                    <i className="fas fa-rotate-left" />
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="edit-media-delete"
                                onClick={() => handleMarkDelete(img.id)}
                                title="Remove image"
                                disabled={isSaving}
                            >
                                <i className="fas fa-times" />
                            </button>
                        )}
                    </div>
                ))}

                {pendingUploads.map((upload, i) => (
                    <div key={upload.previewUrl} className="edit-media-thumb edit-media-pending-add">
                        <img src={upload.previewUrl} alt="" />
                        <span className="edit-media-new-badge">New</span>
                        <button
                            type="button"
                            className="edit-media-delete"
                            onClick={() => removeUpload(i)}
                            title="Cancel upload"
                            disabled={isSaving}
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>
                ))}

                {!atMax && !isSaving && (
                    <div
                        className={`edit-media-add${isDragOver ? ' drag-over' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
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
                disabled={isSaving}
                style={{ display: 'none' }}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />

            <div className="media-manager-save-row">
                {saved && (
                    <span className="media-manager-saved">
                        <i className="fas fa-check-circle" /> Saved
                    </span>
                )}
                {saveError && (
                    <span className="media-manager-error">
                        <i className="fas fa-circle-exclamation" /> Failed to save
                    </span>
                )}
                <ButtonSuccess type="button" onClick={handleSave} disabled={isSaving || !hasPendingChanges}>
                    Save
                </ButtonSuccess>
            </div>
        </div>
    );
}

export default MediaManagerPanel;
