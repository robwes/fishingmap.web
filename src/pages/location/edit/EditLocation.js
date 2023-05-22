import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationService } from '../../../services/locationService';
import { speciesService } from '../../../services/speciesService';
import { permitService } from '../../../services/permitService';
import LocationForm from '../../../components/ui/location/LocationForm';
import './EditLocation.scss';

function EditLocation() {

    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [species, setSpecies] = useState([]);
    const [permits, setPermits] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocation(parseInt(id));
            if (l) {
                setLocation(l);
            }

            const s = await speciesService.getSpecies();
            if (s.length > 0) {
                setSpecies(s);
            }
        })();
    }, [id])

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p.length > 0) {
                setPermits(p);
            }
        })();
    }, [])

    const handleSubmit = async (values, { setSubmitting }) => {
        var updatedLocation = await locationService.updateLocation(
            location.id, 
            {
                id: location.id,
                ...values
            }
        );

        if (updatedLocation) {
            navigate(`/locations/${updatedLocation.id}`);
        }
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${location.name}?`)) {
            await locationService.deleteLocation(location.id);
            navigate(`/locations`);
        }
    }

    const getSpeciesOptions = () => {
        return species.map(s => ({ label: s.name, value: s.id }));
    }

    const getPermitOptions = () => {
        return permits.map(p => ({ label: p.name, value: p.id }));
    }

    const getMapOptions = () => {
        return {
            zoom: 12,
            center: {
                lat: location.position.latitude,
                lng: location.position.longitude
            }
        };
    }

    return (
        location ? (
            <div className="edit-location page">
                <LocationForm
                    title="Edit location"
                    location={location}
                    speciesOptions={getSpeciesOptions()}
                    permitOptions={getPermitOptions()}
                    mapOptions={getMapOptions()}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                />
            </div>) : null
    )
}

export default EditLocation
