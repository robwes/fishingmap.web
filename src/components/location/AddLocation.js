import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationForm from './LocationForm';
import { locationService } from '../../services/locationService';
import { speciesService } from '../../services/speciesService';
import useGeoJson from '../../hooks/useGeoJson';
import './location.css';

function AddLocation() {

    const [species, setSpecies] = useState([]);
    const navigate = useNavigate();
    const { 
        polygonFeatureCollectionToMultiPolygonFeature 
    } = useGeoJson();

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s.length > 0) {
                setSpecies(s);
            }
        })();
    }, [])

    const handleSubmit = async (values, { setSubmitting }) => {
        const locationValues = {
            ...values,
            geometry: JSON.stringify(polygonFeatureCollectionToMultiPolygonFeature(values.geometry))
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
            licenseInfo: "",
            images: []
        };
    };

    const getSpeciesOptions = () => {
        return species.map(s => ({ label: s.name, value: s.id }));
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
        <div className="add-location container container-body page">
            <LocationForm
                title="Add location"
                initialValues={getInitialFormValues()}
                speciesOptions={getSpeciesOptions()}
                mapOptions={getMapOptions()}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default AddLocation
