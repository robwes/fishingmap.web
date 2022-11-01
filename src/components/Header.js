import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';
import authService from '../services/authService';
import { useCurrentUser } from '../hooks/CurrentUserContext';

function Header(props) {

    const { pathname } = useLocation();
    const [currentUser] = useCurrentUser();

    function getLinkCssClasses(currentPath, pathTo) {
        let cssClasses = "nav-link";
        
        if (currentPath === pathTo) {
            cssClasses += " current-page";
        }
        return cssClasses;
    }

    return (
        <header>
            <div className="container container-flex">
                <div className="site-title">
                    <h1 className="title">Fishing Map</h1>
                    <p className="subtitle">Find new fishing places near you</p>
                </div>
                <nav>
                    <ul className='nav-list'>
                        <li>
                            <Link
                                className={getLinkCssClasses(pathname, "/")}
                                to="/"
                            >Map</Link>
                        </li>
                        <li>
                            <Link
                                className={getLinkCssClasses(pathname, "/locations")}
                                to="/locations"
                            >Locations</Link>
                        </li>
                        <li>
                            <Link
                                className={getLinkCssClasses(pathname, "/species")}
                                to="/species"
                            >Species</Link>
                        </li>
                        {currentUser && <li>
                            <UserMenu user={currentUser} />
                        </li>}
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header
