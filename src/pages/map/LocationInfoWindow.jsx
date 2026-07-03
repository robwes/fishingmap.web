import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../components/ui/location/LocationSpeciesItem';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { locationService } from '../../services/locationService';
import { fileService } from '../../services/fileService';
import ImageCarousell from '../../components/ui/imageCarousell/ImageCarousell';
import LocationImagePlaceholder from '../../components/ui/location/LocationImagePlaceholder';
import CollapsibleList from '../../components/ui/collapse/CollapsibleList';
import './LocationInfoWindow.scss';

const LocationInfoWindow = ({ location, onClose }) => {
    const [locationData, setLocationData] = useState(null);

    // Memoize the position and pixelOffset to prevent InfoWindow from re-initializing and closing
    // when the component re-renders due to data fetching.
    const position = useMemo(() => ({
        lat: location.position.latitude,
        lng: location.position.longitude
    }), [location.position.latitude, location.position.longitude]);

    const pixelOffset = useMemo(() => [0, -47], []);

    useEffect(() => {
        (async () => {
            const data = await locationService.getLocation(location.id);
            if (data) {
                setLocationData(data);
            }
        })();
    }, [location.id]);

    const getImages = () => {
        if (locationData && locationData.images && locationData.images.length > 0) {
            return locationData.images.map(image => ({
                url: fileService.getImageUrl(image.path),
                description: locationData.name
            }));
        }

        return [];
    };

    const getSpecies = () => {
        return location.species.map(s => (
            <LocationSpeciesItem key={s.id} species={s} />
        ));
    }

    const images = getImages();

    return (
        <InfoWindow
            pixelOffset={pixelOffset}
            position={position}
            onCloseClick={onClose}
        >
            <div className='location-info-window'>
                <Link to={`/locations/${location.id}`}>
                    <div className="location-info-window-image-container">
                        {!locationData ? (
                            <div className="location-info-window-image-placeholder">Loading...</div>
                        ) : images.length > 0 ? (
                            <ImageCarousell images={images} className="location-info-window-image" />
                        ) : (
                            <LocationImagePlaceholder />
                        )}
                    </div>
                    <h3 className='location-info-window-title'>
                        {location.name}
                    </h3>
                </Link>

                <CollapsibleList className="location-species-collapse" listClassName="location-species-list">
                    {getSpecies()}
                </CollapsibleList>
            </div>
        </InfoWindow>
    );
};

export default LocationInfoWindow;
