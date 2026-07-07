import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import ButtonPrimary from '../../../components/ui/buttons/ButtonPrimary';
import ButtonSecondary from '@/shared/components/buttons/ButtonSecondary';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import { locationService } from '@/shared/services/locationService';
import { speciesService } from '@/shared/services/speciesService';
import { permitService } from '@/shared/services/permitService';
import geoUtils from '@/shared/utils/geoUtils';
import { useToast } from '@/shared/context/ToastContext';
import StepDetails from './steps/StepDetails';
import StepMap from './steps/StepMap';
import StepSpeciesPermits from './steps/StepSpeciesPermits';
import StepPhotos from './steps/StepPhotos';
import './AddLocation.scss';

const formValidation = Yup.object({
    name: Yup.string().max(50, 'Max 50 characters').required('Required'),
    description: Yup.string().max(3000, 'Max 3000 characters').nullable(),
    rules: Yup.string().max(2000, 'Max 2000 characters').nullable(),
    geometry: Yup.object().required('Geometry is required'),
    navigationPosition: Yup.object().nullable(),
});

const STEPS = [
    { n: 1, label: 'Details' },
    { n: 2, label: 'Map' },
    { n: 3, label: 'Species, permits & rules' },
    { n: 4, label: 'Photos' },
];
const TOTAL_STEPS = 4;

// Fields that must be valid before the user can advance from each step.
const STEP_REQUIRED_FIELDS = {
    1: ['name'],
    2: ['geometry'],
};

function AddLocation() {
    const [step, setStep] = useState(1);
    const [panelState, setPanelState] = useState('idle');
    const [species, setSpecies] = useState([]);
    const [permits, setPermits] = useState([]);
    const navigate = useNavigate();
    const showToast = useToast();

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s.length > 0) setSpecies(s);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p.length > 0) setPermits(p);
        })();
    }, []);

    const speciesOptions = species.map(s => ({ label: s.name, value: s.id }));
    const permitOptions = permits.map(p => ({ label: p.name, value: p.id }));

    const goTo = (nextStep) => {
        const fwd = nextStep > step;
        setPanelState(fwd ? 'exit-fwd' : 'exit-bwd');
        setTimeout(() => {
            setStep(nextStep);
            setPanelState(fwd ? 'enter-fwd' : 'enter-bwd');
            setTimeout(() => setPanelState('idle'), 200);
        }, 180);
    };

    /**
     * Validates the required fields for the current step before advancing.
     * If any are invalid, marks them as touched so errors appear and stays
     * on the current step.
     * @param {Function} validateForm - Formik's validateForm function.
     * @param {Function} setTouched - Formik's setTouched function.
     */
    const handleNext = async (validateForm, setTouched) => {
        const requiredFields = STEP_REQUIRED_FIELDS[step] ?? [];
        if (requiredFields.length > 0) {
            const errors = await validateForm();
            const invalid = requiredFields.filter(f => errors[f]);
            if (invalid.length > 0) {
                const touched = {};
                invalid.forEach(f => { touched[f] = true; });
                setTouched(touched, false);
                return;
            }
        }
        goTo(step + 1);
    };

    const handleSubmit = async ({ species = [], permits = [], geometry, images, ...rest }, { setSubmitting }) => {
        const location = {
            species: species.map(s => ({ id: s.value, name: s.label })),
            permits: permits.map(p => ({ id: p.value, name: p.label })),
            geometry: JSON.stringify(geoUtils.polygonFeatureCollectionToMultiPolygonFeature(geometry)),
            images,
            ...rest,
        };
        const newLocation = await locationService.createLocation(location);
        if (newLocation) {
            navigate(`/locations/${newLocation.id}`);
        } else {
            showToast('Failed to add the location. Please try again.');
        }
        setSubmitting(false);
    };

    const panelClass = 'ws-anim-wrap' +
        (panelState === 'exit-fwd' ? ' ws-exit-fwd' : '') +
        (panelState === 'exit-bwd' ? ' ws-exit-bwd' : '') +
        (panelState === 'enter-fwd' ? ' ws-enter-fwd' : '') +
        (panelState === 'enter-bwd' ? ' ws-enter-bwd' : '');

    return (
        <div className="add-location page">
            <div className="alp-container">
                <Formik
                    initialValues={{
                        name: '',
                        description: '',
                        rules: '',
                        geometry: null,
                        navigationPosition: null,
                        species: [],
                        permits: [],
                        images: [],
                    }}
                    validationSchema={formValidation}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, validateForm, setTouched }) => (
                        <Form>
                            <div className="wizard-steps">
                                {STEPS.map((s, i) => (
                                    <React.Fragment key={s.n}>
                                        <div className={`wizard-step${step === s.n ? ' ws-active' : ''}${step > s.n ? ' ws-done' : ''}`}>
                                            <div className="ws-bubble">
                                                {step > s.n ? <i className="fa-solid fa-check" /> : s.n}
                                            </div>
                                            <span className="ws-label">{s.label}</span>
                                        </div>
                                        {i < STEPS.length - 1 && (
                                            <div className={`ws-connector${step > s.n ? ' done' : ''}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="ws-panel-wrap">
                                <div className={panelClass}>
                                    {step === 1 && <StepDetails />}
                                    {step === 2 && <StepMap />}
                                    {step === 3 && <StepSpeciesPermits speciesOptions={speciesOptions} permitOptions={permitOptions} />}
                                    {step === 4 && <StepPhotos />}
                                </div>
                            </div>

                            <div className="wizard-footer">
                                {step > 1 && (
                                    <ButtonSecondary type="button" onClick={() => goTo(step - 1)} disabled={isSubmitting}>
                                        <i className="fa-solid fa-arrow-left" /> Back
                                    </ButtonSecondary>
                                )}
                                <div style={{ flex: 1 }} />
                                {step < TOTAL_STEPS ? (
                                    <ButtonPrimary type="button" onClick={() => handleNext(validateForm, setTouched)}>
                                        Next <i className="fa-solid fa-arrow-right" />
                                    </ButtonPrimary>
                                ) : (
                                    <ButtonSuccess type="submit" disabled={isSubmitting}>
                                        <i className="fa-solid fa-check" /> Add location
                                    </ButtonSuccess>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default AddLocation;
