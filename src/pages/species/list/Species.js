import React, { useEffect, useState } from 'react';
import { speciesService } from '../../../services/speciesService';
import Pagination from '../../../components/ui/pagination/Pagination';
import SpeciesListItem from './SpeciesListItem';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import SearchFilter from '../../../components/ui/searchFilter/SearchFilter';
import './Species.scss';

function Species() {

    const [species, setSpecies] = useState([]);
    const [pagedSpecies, setPagedSpecies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const pageLimit = 10;
    const pageNeighbours = 1;

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s) {
                setSpecies(s);
            }
            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        const pagedSpecies = species.slice(0, pageLimit);
        setPagedSpecies(pagedSpecies);
    }, [species]);

    const handlePageChanged = (data) => {
        const { currentPage, pageLimit } = data;
        const offset = (currentPage - 1) * pageLimit;
        const pagedSpecies = species.slice(offset, offset + pageLimit);

        setPagedSpecies(pagedSpecies);
        window.scrollTo(0, 0);
    };

    const handleSearch = async ({search}) => {
        const species = await speciesService.getSpecies(search);
        if (species) {
            setSpecies(species);
        }
    };

    return (
        <div className="species page">
            {isLoading && <FloatingSpinner />}

            <div className="container">
                <h1 className="page-title">Species</h1>
                <div className="species-search">
                    <SlideInPanel>
                        <SearchFilter onSubmit={handleSearch} />
                    </SlideInPanel>
                </div>

                <div className="item-grid">
                    {pagedSpecies.map(s => (
                        <SpeciesListItem key={s.id} species={s} />
                    ))}
                </div>

                <Pagination totalRecords={species.length} pageLimit={pageLimit} pageNeighbours={pageNeighbours} onPageChanged={handlePageChanged} />
            </div>
        </div>
    )
}

export default Species
