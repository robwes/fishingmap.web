import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationForm from '../../../components/ui/location/LocationForm';
import { locationService } from '../../../services/locationService';
import { speciesService } from '../../../services/speciesService';
import { permitService } from '../../../services/permitService';
import geoUtils from '../../../utils/geoUtils';
import './AddLocation.scss';

function AddLocation() {

    const [species, setSpecies] = useState([]);
    const [permits, setPermits] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s.length > 0) {
                setSpecies(s);
            }
        })();
    }, [])

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p.length > 0) {
                setPermits(p);
            }
        })();
    }, [])

    const handleSubmit = async (values, { setSubmitting }) => {
        const locationValues = {
            ...values,
            geometry: JSON.stringify(
                geoUtils.polygonFeatureCollectionToMultiPolygonFeature(values.geometry)
            )
        };

        var newLocation = await locationService.createLocation(locationValues);

        if (newLocation) {
            navigate(`/locations/${newLocation.id}`);
        }
    }

    const getInitialFormValues = () => {
        return {
            name: "",
            description: "",
            rules: "",
            images: []
        };
    };

    const getSpeciesOptions = () => {
        return species.map(s => ({ label: s.name, value: s.id }));
    }

    const getPermitOptions = () => {
        return permits.map(p => ({ label: p.name, value: p.id}));
    }

    const getMapOptions = () => {
        return {
            zoom: 7,
            center: {
                lat: 60.2,
                lng: 23.5
            }
        };
    }

    return (
        <div className="add-location page">
            <LocationForm
                title="Add location"
                initialValues={getInitialFormValues()}
                speciesOptions={getSpeciesOptions()}
                permitOptions={getPermitOptions()}
                mapOptions={getMapOptions()}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default AddLocation
