import React, { useState, useEffect, useRef } from 'react';
import Error from './Error';
import { useField } from 'formik';
import './form.scss';

// https://blog.logrocket.com/create-a-drag-and-drop-component-with-react-dropzone/
function DragAndDropImage({ text, initialValue = [], wide = false, maxNrOfFiles = 3, ...props }) {
    
    const [selectedFiles, meta, helpers] = useField(props);
    const { setError, setValue: setSelectedFiles } = helpers;

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const fileInputRef = useRef();

    useEffect(() => {
        if (initialValue.length > 0) {
            setSelectedFiles(initialValue);
        }
    }, [initialValue])

    useEffect(() => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = function (e) {
                setImagePreview(e.target.result);
            }
        } else {
            setImagePreview("");
            fileInputRef.current.value = "";
        }
    }, [selectedFile])

    useEffect(() => {
        if (selectedFiles.value && selectedFiles.value.length > 0) {
            setSelectedFile(selectedFiles.value[selectedFiles.value.length - 1]);
        } else {
            setSelectedFile(null);
        }
    }, [selectedFiles.value])

    const addFile = (file) => {
        if (validateFile(file) && !isFileAlreadyAdded(file)) {
            if (selectedFiles.value && selectedFiles.value.length > 0) {
                setSelectedFiles([...selectedFiles.value, file]);
            } else {
                setSelectedFiles([file]);
            }
        }
    }

    const addFiles = (files) => {
        for (let i = 0; i < files.length; i++) {
            addFile(files[i]);
        }
    }

    const isFileAlreadyAdded = (file) => {
        if (!selectedFiles.value) {
            return false;
        }

        for (let i = 0; i < selectedFiles.value.length; i++) {
            if (selectedFiles.value[i].name === file.name) {
                return true;
            }
        }

        return false;
    }

    const handleFileDrop = (e) => {
        e.preventDefault();

        if (isAllowedToAddMoreFiles()) {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                addFiles(files);
            }
        }
    }

    const isAllowedToAddMoreFiles = () => {
        return (!selectedFiles.value || selectedFiles.value.length < maxNrOfFiles);
    }

    const handleFileInputClicked = () => {
        if (isAllowedToAddMoreFiles()) {
            fileInputRef.current.click();
        }
    }

    const handleFilesSelected = () => {
        if (isAllowedToAddMoreFiles() && fileInputRef.current.files.length) {
            addFiles(fileInputRef.current.files);
        }
    }

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        
        let files = [...selectedFiles.value];
        const removeAtIndex = files.indexOf(selectedFile);
        files.splice(removeAtIndex, 1);

        setSelectedFiles(files);
    }

    const showNextPreview = (e) => {
        e.stopPropagation();
        
        let nextFileIndex = selectedFiles.value.indexOf(selectedFile) + 1;
        if (nextFileIndex >= selectedFiles.value.length) {
            nextFileIndex = 0;
        }

        setSelectedFile(selectedFiles.value[nextFileIndex]);
    }

    const showPreviousPreview = (e) => {
        e.stopPropagation();
        
        let previousFileIndex = selectedFiles.value.indexOf(selectedFile) - 1;
        if (previousFileIndex < 0) {
            previousFileIndex = selectedFiles.value.length - 1;
        }

        setSelectedFile(selectedFiles.value[previousFileIndex]);
    }

    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/x-icon'];
        if (validTypes.indexOf(file.type) === -1) {
            setError("File type not supported");
            return false;
        }

        return true;
    }

    // const fileSize = (size) => {
    //     if (size === 0) return '0 Bytes';
    //     const k = 1024;
    //     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    //     const i = Math.floor(Math.log(size) / Math.log(k));
    //     return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    // }

    // const fileType = (fileName) => {
    //     return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
    // }

    const getDropContainerCssClasses = (wide) => {
        let cssClasses = "drop-container";
        if (wide) {
            cssClasses += " drop-container-wide";
        }

        return cssClasses;
    }

    return (
        <div className={props.cssClass || ""}>
            <div className={getDropContainerCssClasses(wide)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                onDragLeave={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={handleFileInputClicked}
            >
                {(selectedFiles.value && selectedFiles.value.length) ? (
                    <div className="preview-panel">
                        <img className="preview-image" src={imagePreview} alt="" />
                        <span className="btn-remove-preview" onClick={handleRemoveFile}>
                            <i className="far fa-times-circle"></i>
                        </span>

                        {selectedFiles.value.length > 1 && (
                            <>
                                <span className="btn-preview-next" onClick={showNextPreview}>
                                    <i className="fas fa-chevron-right"></i>
                                </span>
                                <span className="btn-preview-previous" onClick={showPreviousPreview}>
                                    <i className="fas fa-chevron-left"></i>
                                </span>
                            </>
                        )}
                    </div>
                ) :
                    <div className="drop-panel">
                        <div className="drag-drop-icon"></div>
                        <p className="drag-drop-description">{text}</p>
                    </div>
                }

                <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    onChange={handleFilesSelected}
                    multiple={true}
                />
            </div>
            {meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default DragAndDropImage
