import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useCurrentUser } from '../../../context/CurrentUserContext';
import './Header.scss';

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
        <header className='header'>
            <div className="container container-flex">
                <Link to='/'>
                    <div className="header-title-container">
                        <h1 className="header-title">Fishing Map</h1>
                        <p className="header-subtitle">Fishing locations in Uusimaa</p>
                    </div>
                </Link>
                <nav>
                    <ul className='nav-list'>
                        <li>
                            <Link
                                className={getLinkCssClasses(pathname, "/map")}
                                to="/map"
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
