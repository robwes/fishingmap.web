import React from 'react';
import MultiSelect from '../../../../components/ui/form/MultiSelect';
import TextArea from '../../../../components/ui/form/TextArea';

function StepSpeciesPermits({ speciesOptions, permitOptions }) {
    return (
        <div className="wizard-step-panel">
            <div>
                <h2 className="ws-panel-title">Species, permits &amp; rules</h2>
                <p className="ws-panel-desc">Tag which fish can be caught here, which permits are required, and any rules or restrictions.</p>
            </div>
            <div className="ws-fields">
                <MultiSelect
                    label="Species"
                    name="species"
                    options={speciesOptions}
                    placeholder="Select species…"
                />
                <MultiSelect
                    label="Permits required"
                    name="permits"
                    options={permitOptions}
                    placeholder="Select permits…"
                />
                <TextArea
                    label="Rules &amp; restrictions"
                    name="rules"
                    rows={5}
                    placeholder="e.g. Catch-and-release only. No motorboats. Barbless hooks required."
                />
            </div>
        </div>
    );
}

export default StepSpeciesPermits;
