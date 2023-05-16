import React, { useState, useEffect } from 'react';
import { permitService } from '../../../services/permitService';
import Pagination from '../../../components/ui/pagination/Pagination';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import SearchFilter from '../../../components/ui/searchFilter/SearchFilter';
import './Permits.scss';
import PermitListItem from './PermitListItem';

function Permits() {

    const [permits, setPermits] = useState([]);
    const [pagedPermits, setPagedPermits] = useState([]);
    const pageLimit = 8;
    const pageNeighbours = 1;

    useEffect(() => {
        (async () => {
            const p = await permitService.getPermits();
            if (p) {
                setPermits(p);
            }
        })();
    }, []);

    useEffect(() => {
        const pagedPermits = permits.slice(0, pageLimit);
        setPagedPermits(pagedPermits);
    }, [permits]);

    const handlePageChanged = (data) => {
        const { currentPage, pageLimit } = data;
        const offset = (currentPage - 1) * pageLimit;
        const pagedPermits = permits.slice(offset, offset + pageLimit);

        setPagedPermits(pagedPermits);
    };

    const handleSearch = async ({ search }) => {
        const permits = await permitService.getPermits(search);
        if (permits) {
            setPermits(permits);
        }
    };

    return (
        <div className='permits page'>
            <div className='container center-content'>
                <h1 className='page-title'>Permits</h1>
                <SlideInPanel>
                    <SearchFilter onSubmit={handleSearch} />
                </SlideInPanel>
                <div className='permits-list'>
                    {pagedPermits.map(p => (
                        <PermitListItem key={p.id} permit={p} />
                    ))}
                </div>
                <Pagination totalRecords={permits.length} pageLimit={pageLimit} pageNeighbours={pageNeighbours} onPageChanged={handlePageChanged} />
            </div>
        </div>
    )
}

export default Permits