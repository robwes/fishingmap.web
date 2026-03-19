import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../components/ui/location/LocationSpeciesItem';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { locationService } from '../../services/locationService';
import ImageCarousell from '../../components/ui/imageCarousell/ImageCarousell';
import lake from '../../assets/images/lake.png';
import CollapsibleList from '../../components/ui/collapse/CollapsibleList';
import './LocationInfoWindow.scss';
import LinkItem from '../../components/ui/linkItem/LinkItem';

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
        const images = [];

        if (locationData && locationData.images && locationData.images.length > 0) {
            locationData.images.forEach(image => {
                images.push({
                    url: `${import.meta.env.VITE_IMAGES_URL}/${image.path}`,
                    description: locationData.name
                });
            });
        } else {
            images.push({
                url: lake,
                description: "Default location image"
            });
        }

        return images;
    };

    const getSpecies = () => {
        return location.species.map(s => (
            <LocationSpeciesItem key={s.id} species={s} />
        ));
    }

    return (
        <InfoWindow
            pixelOffset={pixelOffset}
            position={position}
            onCloseClick={onClose}
        >
            <div className='location-info-window'>
                <Link to={`/locations/${location.id}`}>
                    <div className="location-info-window-image-container">
                        {locationData ? (
                            <ImageCarousell images={getImages()} className="location-info-window-image" />
                        ) : (
                            <div className="location-info-window-image-placeholder">Loading...</div>
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
