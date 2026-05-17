import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { permitService } from '../../../services/permitService';
import Pagination from '../../../components/ui/pagination/Pagination';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import SearchFilter from '../../../components/ui/searchFilter/SearchFilter';
import PermitListItem from './PermitListItem';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import './Permits.scss';

function Permits() {

    const [permits, setPermits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const pageLimit = 8;
    const pageNeighbours = 1;
    const currentPage = parseInt(searchParams.get('page')) || 1;

    const pagedPermits = permits.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p) {
                setPermits(p);
            }
            setIsLoading(false);
        })();
    }, []);

    const handlePageChanged = (page) => {
        setSearchParams(page > 1 ? { page } : {}, { replace: true });
        window.scrollTo(0, 0);
    };

    const handleSearch = async ({ search }) => {
        const permits = await permitService.getPermits(search);
        if (permits) {
            setSearchParams({}, { replace: true });
            setPermits(permits);
        }
    };

    return (
        <div className='permits page'>
            {isLoading && <FloatingSpinner />}

            <div className='container center-content'>
                <SlideInPanel>
                    <SearchFilter onSubmit={handleSearch} />
                </SlideInPanel>
                <h1 className='page-title'>Permits</h1>
                <div className='permits-list'>
                    {pagedPermits.map(p => (
                        <PermitListItem key={p.id} permit={p} />
                    ))}
                </div>
            </div>
            <Pagination totalRecords={permits.length} pageLimit={pageLimit} pageNeighbours={pageNeighbours} currentPage={currentPage} onPageChanged={handlePageChanged} />
        </div>
    )
}

export default Permits
