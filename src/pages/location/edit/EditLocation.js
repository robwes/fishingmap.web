import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationService } from '../../../services/locationService';
import { speciesService } from '../../../services/speciesService';
import { permitService } from '../../../services/permitService';
import { fileService } from '../../../services/fileService';
import LocationForm from '../../../components/ui/location/LocationForm';
import geoUtils from '../../../utils/geoUtils';
import './EditLocation.scss';

function EditLocation() {

    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [species, setSpecies] = useState([]);
    const [permits, setPermits] = useState([]);
    
    const [locationImages, setLocationImages] = useState([]);
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
            if (location && location.images) {

                const images = [];

                for (let image of location.images) {
                    const imageFile = await fileService.getImage(image.path, image.name);
                    if (imageFile) {
                        images.push(imageFile);
                    }
                }

                setLocationImages(images);
            }
        })();
    }, [location])

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p.length > 0) {
                setPermits(p);
            }
        })();
    }, [])

    const handleSubmit = async (locationValues, { setSubmitting }) => {
        const locationUpdate = {
            ...locationValues,
            geometry: JSON.stringify(
                geoUtils.polygonFeatureCollectionToMultiPolygonFeature(locationValues.geometry)
            )
        };

        var updatedLocation = await locationService.updateLocation(id, locationUpdate);

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

    const getInitialFormValues = () => {
        return {
            ...location,
            species: location.species.map(s => ({ label: s.name, value: s.id })),
            permits: location.permits.map(p => ({ label: p.name, value: p.id })),
            geometry: geoUtils.multiPolygonFeatureToPolygonFeatureCollection(JSON.parse(location.geometry)),
            images: locationImages
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
                    initialValues={getInitialFormValues()}
                    speciesOptions={getSpeciesOptions()}
                    permitOptions={getPermitOptions()}
                    mapOptions={getMapOptions()}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    operation='edit'
                />
            </div>) : null
    )
}

export default EditLocation
