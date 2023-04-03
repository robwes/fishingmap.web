import React from 'react';
import Input from '../form/Input';
import MultiSelect from '../form/MultiSelect';
import DragAndDropImage from '../form/DragAndDropImage';
import CollapsibleTextarea from '../form/CollapsibleTextarea';
import ArticleInput from '../form/ArticleInput';
import './LocationFormCard.scss';

function LocationFormCard({ initialValues, speciesOptions }) {
    return (
        <div className="location-form-card">
            <DragAndDropImage
                text="Add some images"
                name="images"
                maxNrOfFiles={5}
                className="location-form-card-image"
                initialValue={initialValues?.images}
            />
            <div className="location-form-card-body">
                <Input
                    label="Name"
                    name="name"
                    type="text"
                />
                <MultiSelect
                    label="Species"
                    name="species"
                    options={speciesOptions}
                />
                <CollapsibleTextarea
                    label="Permits"
                    name="licenseInfo"
                    rows="6"
                />
            </div>
            <ArticleInput
                className='location-form-card-footer'
                label='Rules'
                name='rules'
                rows={15}
            />
        </div>
    )
}

export default LocationFormCard