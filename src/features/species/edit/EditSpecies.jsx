import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speciesService } from '@/shared/services/speciesService';
import FloatingSpinner from '@/shared/components/spinner/FloatingSpinner';
import EditSpeciesBasicPanel from './panels/EditSpeciesBasicPanel';
import MediaManagerPanel from '@/shared/components/media/MediaManagerPanel';
import './EditSpecies.scss';

const SECTIONS = [
    { id: 'info',   icon: 'fa-circle-info', label: 'Basic info', shortLabel: 'Info'   },
    { id: 'photos', icon: 'fa-images',      label: 'Photos',     shortLabel: 'Photos' },
];

function EditSpecies() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [species, setSpecies] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [active, setActive] = useState('info');

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpeciesById(parseInt(id));
            if (s) setSpecies(s);
            setIsLoading(false);
        })();
        // eslint-disable-next-line
    }, []);

    const handleSpeciesUpdated = (updated) => setSpecies(updated);

    const activeSection = SECTIONS.find(s => s.id === active);

    return (
        <div className="edit-species page">
            {isLoading && <FloatingSpinner />}

            {species && (
                <>
                    <div className="edit-species-header">
                        <button className="edit-species-back"
                            onClick={() => navigate(`/species/${species.id}`)}>
                            <i className="fas fa-chevron-left" /> {species.name}
                        </button>
                        <div className="edit-species-header-row">
                            <h1 className="edit-species-title">Edit species</h1>
                        </div>
                        <p className="edit-species-subtitle">{species.name}</p>
                    </div>

                    <div className="edit-species-body">
                        <nav className="edit-species-sidebar">
                            {SECTIONS.map(s => (
                                <button key={s.id}
                                    className={`edit-species-nav-item${active === s.id ? ' active' : ''}`}
                                    onClick={() => setActive(s.id)}
                                >
                                    <i className={`fas ${s.icon} edit-species-nav-icon`} />
                                    <span className="edit-species-nav-label">{s.label}</span>
                                    <span className="edit-species-nav-label-short">{s.shortLabel}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="edit-species-panel">
                            <div className="edit-species-panel-heading">
                                <i className={`fas ${activeSection.icon}`} />
                                <h2>{activeSection.label}</h2>
                            </div>

                            {active === 'info' && (
                                <EditSpeciesBasicPanel
                                    species={species}
                                    onSpeciesUpdated={handleSpeciesUpdated}
                                />
                            )}
                            {active === 'photos' && (
                                <MediaManagerPanel
                                    images={species.images}
                                    maxImages={4}
                                    addImage={(file) => speciesService.addImageToSpecies(species.id, file)}
                                    removeImage={(imageId) => speciesService.removeImageFromSpecies(species.id, imageId)}
                                    refetch={() => speciesService.getSpeciesById(species.id)}
                                    onSaved={handleSpeciesUpdated}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default EditSpecies;
