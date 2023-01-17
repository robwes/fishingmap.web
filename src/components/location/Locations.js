import React, { useEffect, useState } from 'react'
import { locationService } from '../../services/locationService'
import Pagination from '../common/Pagination';
import SlideInPanel from '../common/SlideInPanel';
import LocationFilter from './LocationFilter';
import LocationListItem from './LocationListItem';
import { useCurrentUser } from '../../hooks/CurrentUserContext';
import './location.scss';

function Locations() {

    const [locations, setLocations] = useState([]);
    const [pagedLocations, setPagedLocations] = useState([]);
    const [currentUser, setCurrentUser, currentLocation] = useCurrentUser();

    const pageLimit = 10;
    const pageNeighbours = 1;

    useEffect(() => {
        (async () => {
            const l = await locationService.getLocations();
            if (l) {
                setLocations(l);
            }
        })();
    }, [])

    useEffect(() => {
        const pagedLocations = locations.slice(0, pageLimit);
        setPagedLocations(pagedLocations);
    }, [locations])

    const handleSearch = async ({ search, species, distance }, { setSubmitting }) => {
        const matchingLocations = await locationService.getLocations(search, species, distance, currentLocation);
        setLocations(matchingLocations);
    }

    const handleReset = async () => {
        const locations = await locationService.getLocations();
        if (locations) {
            setLocations(locations);
        }
    }

    const handlePageChanged = (data) => {
        const { currentPage, pageLimit } = data;
        const offset = (currentPage - 1) * pageLimit;
        const currentLocations = locations.slice(offset, offset + pageLimit);

        setPagedLocations(currentLocations);
    };

    return (
        <div className="container page">
            <div className="locations">
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
