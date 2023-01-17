import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/CurrentUserContext';
import authService from '../services/authService';
import './components.scss';

function UserMenu({ user, open }) {

	const [isOpen, setIsOpen] = useState(open ?? false);
	const [_, setCurrentUser] = useCurrentUser();

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
				<i className="fas fa-user"></i>
			</button>

			<div className='user-menu-dropdown'>

				<ul className='user-menu-list'>
					<li className='username'>
						<Link
							className='dropdown-button'
							to={`/users/${user.id}/edit`}>
							{user.userName}
						</Link>
					</li>
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