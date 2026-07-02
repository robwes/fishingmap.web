import React from 'react';
import './Pagination.scss';

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
}

function Pagination({ totalRecords, pageLimit, pageNeighbours, currentPage, onPageChanged }) {

    const totalPages = Math.ceil(totalRecords / pageLimit);

    const fetchPageNumbers = () => {
        const totalNumbers = (pageNeighbours * 2) + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            const startPage = Math.max(2, currentPage - pageNeighbours);
            const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
            let pages = range(startPage, endPage);

            const hasLeftSpill = startPage > 2;
            const hasRightSpill = (totalPages - endPage) > 1;
            const spillOffset = totalNumbers - (pages.length + 1);

            switch (true) {
                case (hasLeftSpill && !hasRightSpill): {
                    const extraPages = range(startPage - spillOffset, startPage - 1);
                    pages = [LEFT_PAGE, ...extraPages, ...pages];
                    break;
                }

                case (!hasLeftSpill && hasRightSpill): {
                    const extraPages = range(endPage + 1, endPage + spillOffset);
                    pages = [...pages, ...extraPages, RIGHT_PAGE];
                    break;
                }

                case (hasLeftSpill && hasRightSpill):
                default: {
                    pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
                    break;
                }
            }

            return [1, ...pages, totalPages];
        }

        return range(1, totalPages);
    }

    const gotoPage = page => {
        const next = Math.max(1, Math.min(page, totalPages));
        if (next !== currentPage) {
            onPageChanged(next);
        }
    }

    const pages = fetchPageNumbers();

    return (
        <ul className="pagination">
            {pages.map(page => {

                if (page === LEFT_PAGE) return (
                    <li key={page} className="page-item">
                        <button type="button" className="page-link" aria-label="Previous" onClick={() => gotoPage(currentPage - 1)}>
                            <i className="fas fa-chevron-left" aria-hidden="true"></i>
                        </button>
                    </li>
                );

                if (page === RIGHT_PAGE) return (
                    <li key={page} className="page-item">
                        <button type="button" className="page-link" aria-label="Next" onClick={() => gotoPage(currentPage + 1)}>
                            <i className="fas fa-chevron-right" aria-hidden="true"></i>
                        </button>
                    </li>
                );

                return (
                    <li key={page} className="page-item">
                        <button
                            type="button"
                            className={`page-link${currentPage === page ? ' active' : ''}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                            onClick={() => gotoPage(page)}
                        >{page}</button>
                    </li>
                );
            })}
        </ul>
    )
}

export default Pagination
