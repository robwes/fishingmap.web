import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/CurrentUserContext';
import authService from '../services/authService';
import './components.css';

function UserMenu({user}) {

	const [isOpen, setIsOpen] = useState(false);
	const [currentUser, setCurrentUser] = useCurrentUser();

	const toggleUserMenu = (event) => {
		event.preventDefault();
		setIsOpen(!isOpen);
	};

	const getCssClasses = () => {
		if (isOpen) {
			return 'user-menu open';
		}
		return 'user-menu';
	};

	const logoutUser = async () => {
		await authService.logout();
		setCurrentUser(null);
		setIsOpen(false);
	};

	return (
		<div className={getCssClasses()}>
			<button className='user-menu-toggle' onClick={toggleUserMenu}>
				<i className="fas fa-caret-down"></i>
			</button>

			<div className='user-menu-dropdown'>
				
				<ul className='user-menu-list'>
					<li className='username'><a className='dropdown-button' href='#'>{user.username}</a></li>
					<li className='list-separator'></li>
					<li>
						<button onClick={logoutUser} className='dropdown-button'>Sign out</button>
					</li>
				</ul>
			</div>
		</div>
	)
}

export default UserMenu