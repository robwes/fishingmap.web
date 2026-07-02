import React from 'react';
import Input from '../../../../components/ui/form/Input';
import TextArea from '../../../../components/ui/form/TextArea';

function StepDetails() {
    return (
        <div className="wizard-step-panel">
            <div>
                <h2 className="ws-panel-title">Location details</h2>
                <p className="ws-panel-desc">Start with the basics — give your location a name and a short description.</p>
            </div>
            <div className="ws-fields">
                <Input
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="e.g. Kalajärvi"
                />
                <TextArea
                    label="Description"
                    name="description"
                    rows={6}
                    placeholder="Describe the location, how to access it, best spots to fish…"
                />
            </div>
        </div>
    );
}

export default StepDetails;
