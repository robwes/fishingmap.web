import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationService } from '@/shared/services/locationService';
import { speciesService } from '@/shared/services/speciesService';
import { permitService } from '@/shared/services/permitService';
import FloatingSpinner from '@/shared/components/spinner/FloatingSpinner';
import { useCurrentUser } from '@/shared/context/CurrentUserContext';
import EditBasicInfoPanel from './panels/EditBasicInfoPanel';
import MediaManagerPanel from '@/shared/components/media/MediaManagerPanel';
import EditAssocPanel from './panels/EditAssocPanel';
import EditGeoPanel from './panels/EditGeoPanel';
import './EditLocation.scss';

const EDIT_SECTIONS = [
    { id: 'info',  icon: 'fa-circle-info', label: 'Basic info',        shortLabel: 'Info' },
    { id: 'media', icon: 'fa-images',      label: 'Media',             shortLabel: 'Media' },
    { id: 'assoc', icon: 'fa-tags',        label: 'Species & permits', shortLabel: 'Species' },
    { id: 'geo',   icon: 'fa-map',         label: 'Geometry',          shortLabel: 'Geometry', adminOnly: true },
];

function EditLocation() {
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [species, setSpecies] = useState([]);
    const [permits, setPermits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('info');
    const [currentUser] = useCurrentUser();
    const navigate = useNavigate();

    const isAdmin = !!(currentUser?.roles?.some(r => r.name === 'Administrator'));

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocation(parseInt(id));
            if (l) setLocation(l);
            const s = await speciesService.getSpecies();
            if (s.length > 0) setSpecies(s);
            setIsLoading(false);
        })();
    }, [id]);

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p.length > 0) setPermits(p);
        })();
    }, []);

    const speciesOptions = species.map(s => ({ label: s.name, value: s.id }));
    const permitOptions = permits.map(p => ({ label: p.name, value: p.id }));

    const activeSecDef = EDIT_SECTIONS.find(s => s.id === activeSection);
    const renderPanel = () => {
        if (!location) return null;
        switch (activeSection) {
            case 'info':  return <EditBasicInfoPanel location={location} onLocationUpdated={setLocation} />;
            case 'media': return (
                <MediaManagerPanel
                    images={location.images}
                    maxImages={5}
                    addImage={(file) => locationService.addImageToLocation(location.id, file)}
                    removeImage={(imageId) => locationService.removeImageFromLocation(location.id, imageId)}
                    refetch={() => locationService.getLocation(location.id)}
                    onSaved={setLocation}
                />
            );
            case 'assoc': return <EditAssocPanel location={location} speciesOptions={speciesOptions} permitOptions={permitOptions} onLocationUpdated={setLocation} />;
            case 'geo':   return <EditGeoPanel location={location} isAdmin={isAdmin} onLocationUpdated={setLocation} />;
            default:      return null;
        }
    };

    return (
        <div className="edit-location page">
            {isLoading && <FloatingSpinner />}
            {location && (
                <>
                    <div className="elp-header">
                        <button
                            type="button"
                            className="elp-back-link"
                            onClick={() => navigate(`/locations/${location.id}`)}
                        >
                            <i className="fas fa-chevron-left" /> {location.name}
                        </button>
                        <div className="elp-header-row">
                            <h1 className="elp-title">Edit location</h1>
                        </div>
                        <p className="elp-subtitle">{location.name}</p>
                    </div>

                    <div className="edit-location-layout">
                        <nav className="edit-location-sidebar">
                            {EDIT_SECTIONS.map(s => {
                                const locked = s.adminOnly && !isAdmin;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        className={`edit-nav-item${activeSection === s.id ? ' active' : ''}${locked ? ' locked' : ''}`}
                                        onClick={() => !locked && setActiveSection(s.id)}
                                    >
                                        <i className={`fas ${s.icon} edit-nav-icon`} />
                                        <span className="edit-nav-label">{s.label}</span>
                                        <span className="edit-nav-label-short">{s.shortLabel}</span>
                                        {locked && <i className="fas fa-lock edit-nav-lock" />}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="edit-location-panel">
                            <div className="edit-panel-heading">
                                <i className={`fas ${activeSecDef?.icon}`} style={{ color: 'var(--clr-primary)' }} />
                                <h2 className="edit-panel-title">{activeSecDef?.label}</h2>
                                {activeSecDef?.adminOnly && !isAdmin && (
                                    <span className="edit-admin-badge">
                                        <i className="fas fa-lock" /> Admin only
                                    </span>
                                )}
                            </div>
                            {renderPanel()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default EditLocation;
