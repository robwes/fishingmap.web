import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // eslint-disable-next-line
    const [currentUser, setCurrentUser, currentLocation] = useCurrentUser();

    const pageLimit = 10;
    const pageNeighbours = 1;
    const currentPage = parseInt(searchParams.get('page')) || 1;

    const pagedLocations = locations.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocationsSummary();
            if (l) {
                setLocations(l);
            }
            setIsLoading(false);
        })();
    }, [])

    const handleSearch = async ({ search, species, distance }, { setSubmitting }) => {
        const matchingLocations = await locationService.getLocationsSummary(search, species, distance, currentLocation);
        setSearchParams({}, { replace: true });
        setLocations(matchingLocations);
    }

    const handleReset = async () => {
        const locations = await locationService.getLocationsSummary();
        if (locations) {
            setSearchParams({}, { replace: true });
            setLocations(locations);
        }
    }

    const handlePageChanged = (page) => {
        setSearchParams(page > 1 ? { page } : {}, { replace: true });
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
                        onReset={handleReset}
                        resultCount={locations.length} />
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
            <Pagination totalRecords={locations.length} pageLimit={pageLimit} pageNeighbours={pageNeighbours} currentPage={currentPage} onPageChanged={handlePageChanged} />
        </div>
    )
}

export default Locations
