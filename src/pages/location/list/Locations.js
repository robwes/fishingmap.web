import React, { useEffect, useState } from 'react';
import LocationListItem from './LocationListItem';
import Pagination from '../../../components/ui/pagination/Pagination';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import LocationFilter from '../../../components/ui/location/LocationFilter';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import { locationService } from '../../../services/locationService';
import { useCurrentUser } from '../../../context/CurrentUserContext';
import './Locations.scss';

function Locations() {

    const [locations, setLocations] = useState([]);
    const [pagedLocations, setPagedLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // eslint-disable-next-line
    const [currentUser, setCurrentUser, currentLocation] = useCurrentUser();

    const pageLimit = 10;
    const pageNeighbours = 1;

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocationsSummary();
            if (l) {
                setLocations(l);
            }
            setIsLoading(false);
        })();
    }, [])

    useEffect(() => {
        if (locations?.length > 0) {
            const pagedLocations = locations.slice(0, pageLimit);
            setPagedLocations(pagedLocations);
        }
        else {
            setPagedLocations([]);
        }

    }, [locations])

    const handleSearch = async ({ search, species, distance }, { setSubmitting }) => {
        const matchingLocations = await locationService.getLocationsSummary(search, species, distance, currentLocation);
        setLocations(matchingLocations);
    }

    const handleReset = async () => {
        const locations = await locationService.getLocationsSummary();
        if (locations) {
            setLocations(locations);
        }
    }

    const handlePageChanged = (data) => {
        const { currentPage, pageLimit } = data;
        const offset = (currentPage - 1) * pageLimit;
        const currentLocations = locations.slice(offset, offset + pageLimit);

        setPagedLocations(currentLocations);
        window.scrollTo(0, 0);
    };

    return (
        <div className="locations page">
            {isLoading && <FloatingSpinner />}

            <div className="container">
                <div className="left">
                    <SlideInPanel>
                        <LocationFilter 
                        onSubmit={handleSearch}
                        onReset={handleReset} />
                    </SlideInPanel>
                </div>
                <div className="right">
                    <div className="item-list">
                        {pagedLocations.map(l => (
                            <LocationListItem key={l.id} location={l} />
                        ))}
                    </div>
                </div>
            </div>
            <Pagination totalRecords={locations.length} pageLimit={pageLimit} pageNeighbours={pageNeighbours} onPageChanged={handlePageChanged} />
        </div>
    )
}

export default Locations
