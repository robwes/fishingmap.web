import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { speciesService } from '../../../services/speciesService';
import Pagination from '../../../components/ui/pagination/Pagination';
import SpeciesListItem from './SpeciesListItem';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import SearchFilter from '../../../components/ui/searchFilter/SearchFilter';
import './Species.scss';

function Species() {

    const [species, setSpecies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const pageLimit = 10;
    const pageNeighbours = 1;
    const currentPage = parseInt(searchParams.get('page')) || 1;

    const pagedSpecies = species.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

    useEffect(() => {
        (async () => {
            const s = await speciesService.getSpecies();
            if (s) {
                setSpecies(s);
            }
            setIsLoading(false);
        })();
    }, []);

    const handlePageChanged = (page) => {
        setSearchParams(page > 1 ? { page } : {}, { replace: true });
        window.scrollTo(0, 0);
    };

    const handleSearch = async ({search}) => {
        const species = await speciesService.getSpecies(search);
        if (species) {
            setSearchParams({}, { replace: true });
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
            </div>
            <Pagination totalRecords={species.length} pageLimit={pageLimit} pageNeighbours={pageNeighbours} currentPage={currentPage} onPageChanged={handlePageChanged} />
        </div>
    )
}

export default Species
