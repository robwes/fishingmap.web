import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/shared/context/CurrentUserContext';
import authService from '@/features/auth/authService';
import './UserMenu.scss';

function UserMenu({ user, open }) {

	const [isOpen, setIsOpen] = useState(open ?? false);

	const [, setCurrentUser] = useCurrentUser();

	// Region admin is the only screen gated on a role rather than on being
	// signed in, so it stays out of the header nav every visitor sees.
	const isAdministrator = !!user?.roles?.some(role => role.name === 'Administrator');

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
					{isAdministrator && (
						<>
							<li className='list-separator'></li>
							<li>
								<Link
									className='dropdown-button'
									to='/regions'
									onClick={() => setIsOpen(false)}>
									Regions &amp; regulations
								</Link>
							</li>
						</>
					)}
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
