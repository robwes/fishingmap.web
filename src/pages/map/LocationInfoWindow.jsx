import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LocationSpeciesItem from '../../components/ui/location/LocationSpeciesItem';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { locationService } from '../../services/locationService';
import { fileService } from '../../services/fileService';
import { useCurrentUser } from '../../context/CurrentUserContext';
import geoUtils from '../../utils/geoUtils';
import { formatKm } from '../../utils/formatDistance';
import ImageCarousell from '../../components/ui/imageCarousell/ImageCarousell';
import LocationImagePlaceholder from '../../components/ui/location/LocationImagePlaceholder';
import CollapsibleList from '../../components/ui/collapse/CollapsibleList';
import './LocationInfoWindow.scss';

const LocationInfoWindow = ({ location, onClose }) => {
    const [locationData, setLocationData] = useState(null);
    const [, , currentLocation] = useCurrentUser();

    // Memoize the position and pixelOffset to prevent InfoWindow from re-initializing and closing
    // when the component re-renders due to data fetching.
    const position = useMemo(() => ({
        lat: location.position.latitude,
        lng: location.position.longitude
    }), [location.position.latitude, location.position.longitude]);

    const pixelOffset = useMemo(() => [0, -47], []);

    // Distance from the user to this spot, when we know where they are.
    const distanceLabel = useMemo(() => {
        if (!currentLocation) {
            return null;
        }
        return `${formatKm(geoUtils.distanceKm(currentLocation, location.position))} away`;
    }, [currentLocation, location.position]);

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
    const detailsUrl = `/locations/${location.id}`;
    // Only once the details have loaded do we know there are no photos; until
    // then we show a neutral loading tile at full height.
    const isPlaceholder = locationData && images.length === 0;

    return (
        <InfoWindow
            pixelOffset={pixelOffset}
            position={position}
            onCloseClick={onClose}
        >
            <div className='location-info-window'>
                <Link to={detailsUrl} className="location-info-window-header">
                    <div className={`location-info-window-image-container${isPlaceholder ? ' is-placeholder' : ''}`}>
                        {!locationData ? (
                            <div className="location-info-window-image-placeholder">Loading...</div>
                        ) : images.length > 0 ? (
                            <ImageCarousell images={images} className="location-info-window-image" />
                        ) : (
                            <LocationImagePlaceholder subtle />
                        )}
                        {distanceLabel && (
                            <div className="location-info-window-distance">
                                <i className="fas fa-location-arrow" aria-hidden="true" /> {distanceLabel}
                            </div>
                        )}
                    </div>
                    <h3 className='location-info-window-title'>
                        {location.name}
                    </h3>
                    <div className="location-info-window-details-hint">
                        View details <i className="fas fa-arrow-right" aria-hidden="true" />
                    </div>
                </Link>

                <CollapsibleList
                    className="location-species-collapse"
                    listClassName="location-species-list"
                    closedLabel={`Show all ${location.species.length} species`}
                    openLabel="Show fewer"
                >
                    {getSpecies()}
                </CollapsibleList>
            </div>
        </InfoWindow>
    );
};

export default LocationInfoWindow;
