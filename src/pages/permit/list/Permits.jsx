import React from 'react';
import { permitService } from '@/shared/services/permitService';
import Pagination from '@/shared/components/pagination/Pagination';
import SlideInPanel from '@/shared/components/slideInPanel/SlideInPanel';
import SearchInput from '@/shared/components/form/SearchInput';
import PermitListItem from './PermitListItem';
import FloatingSpinner from '@/shared/components/spinner/FloatingSpinner';
import useUrlFilters from '@/shared/hooks/useUrlFilters';
import useDebouncedQuery from '@/shared/hooks/useDebouncedQuery';
import './Permits.scss';

const PAGE_LIMIT = 8;
const PAGE_NEIGHBOURS = 1;

function Permits() {
    const { searchParams, patchParams, currentPage, goToPage } = useUrlFilters();

    const search = searchParams.get('q') ?? '';

    const { data: permits, isLoading } = useDebouncedQuery(
        () => permitService.getPermits(search),
        [search],
        { initial: [] }
    );

    const pagedPermits = permits.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT);

    const onSearch = (value) => patchParams({ q: value, page: '' });

    return (
        <div className='permits page'>
            {isLoading && <FloatingSpinner />}

            <SlideInPanel>
                <SearchInput
                    value={search}
                    onChange={onSearch}
                    placeholder="Search permits…"
                    ariaLabel="Search permits"
                />
            </SlideInPanel>

            <div className='container center-content'>
                <h1 className='page-title'>Permits</h1>

                <div className='permits-list'>
                    {pagedPermits.map(p => (
                        <PermitListItem key={p.id} permit={p} />
                    ))}
                </div>
            </div>

            <Pagination
                totalRecords={permits.length}
                pageLimit={PAGE_LIMIT}
                pageNeighbours={PAGE_NEIGHBOURS}
                currentPage={currentPage}
                onPageChanged={goToPage}
            />
        </div>
    )
}

export default Permits
