import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../../context/CurrentUserContext';
import { speciesService } from '../../../services/speciesService';
import Pagination from '../../../components/ui/pagination/Pagination';
import ButtonSuccess from '../../../components/ui/buttons/ButtonSuccess';
import SlideInPanel from '../../../components/ui/slideInPanel/SlideInPanel';
import SearchInput from '../../../components/ui/form/SearchInput';
import SpeciesListItem from './SpeciesListItem';
import FloatingSpinner from '../../../components/ui/spinner/FloatingSpinner';
import useUrlFilters from '../../../hooks/useUrlFilters';
import useDebouncedQuery from '../../../hooks/useDebouncedQuery';
import './Species.scss';

const PAGE_LIMIT = 12;
const PAGE_NEIGHBOURS = 1;

function Species() {
    const navigate = useNavigate();
    const [currentUser] = useCurrentUser();
    const { searchParams, patchParams, currentPage, goToPage } = useUrlFilters();

    const search = searchParams.get('q') ?? '';

    const { data: species, isLoading } = useDebouncedQuery(
        () => speciesService.getSpecies(search),
        [search],
        { initial: [] }
    );

    const paged = species.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT);

    // Hide the count until the first fetch resolves so the page doesn't flash
    // "0 species" on entry. Re-queries keep the previous data, so the count
    // stays visible while searching.
    const showCount = !isLoading || species.length > 0;

    const onSearch = (value) => patchParams({ q: value, page: '' });

    return (
        <div className="species page">
            {isLoading && <FloatingSpinner />}

            <SlideInPanel>
                <SearchInput
                    value={search}
                    onChange={onSearch}
                    placeholder="Search…"
                    ariaLabel="Search species"
                />
            </SlideInPanel>

            <div className="container">
                {currentUser && (
                    <div className="species-list-header">
                        <ButtonSuccess onClick={() => navigate('/species/add')}>
                            <i className="fas fa-plus" /> Add species
                        </ButtonSuccess>
                    </div>
                )}

                <div className="species-toolbar">
                    <SearchInput
                        value={search}
                        onChange={onSearch}
                        placeholder="Search…"
                        ariaLabel="Search species"
                    />
                </div>

                <div className="species-count-row">
                    {showCount && (
                        <span className="species-result-count"><b>{species.length}</b> species</span>
                    )}
                </div>

                {species.length === 0 && !isLoading ? (
                    <div className="species-empty">
                        <i className="fas fa-fish" />
                        {search ? <span>No species match <b>“{search}”</b>.</span> : <span>No species yet.</span>}
                    </div>
                ) : (
                    <div className="item-grid">
                        {paged.map((s) => <SpeciesListItem key={s.id} species={s} />)}
                    </div>
                )}
            </div>

            <Pagination
                totalRecords={species.length}
                pageLimit={PAGE_LIMIT}
                pageNeighbours={PAGE_NEIGHBOURS}
                currentPage={currentPage}
                onPageChanged={goToPage}
            />
        </div>
    );
}

export default Species;
