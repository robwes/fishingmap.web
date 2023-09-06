import React from 'react';
import Input from '../form/Input';
import MultiSelect from '../form/MultiSelect';
import DragAndDropImage from '../form/DragAndDropImage';
import ArticleInput from '../form/ArticleInput';
import './LocationFormCard.scss';

function LocationFormCard({ speciesOptions, permitOptions, disabled = false }) {

    return (
        <div className="location-form-card">
            <DragAndDropImage
                text="Add some images"
                name="images"
                maxNrOfFiles={5}
                className="location-form-card-image"
                disabled={disabled}

            />
            <div className="location-form-card-body">
                <Input
                    label="Name"
                    name="name"
                    type="text"
                    disabled={disabled}
                />
                <MultiSelect
                    label="Species"
                    name="species"
                    options={speciesOptions}
                    disabled={disabled}
                />
                <MultiSelect
                    label="Permits"
                    name="permits"
                    options={permitOptions}
                    disabled={disabled}
                />
            </div>
            <ArticleInput
                className='location-form-card-footer'
                label='Rules'
                name='rules'
                rows={15}
                disabled={disabled}
            />
        </div>
    )
}

export default LocationFormCard