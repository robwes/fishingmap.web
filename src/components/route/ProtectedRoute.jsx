import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '@/shared/context/CurrentUserContext';

function ProtectedRoute({ redirectPath = "/", requiredRoles = [], children }) {

	const [currentUser] = useCurrentUser();

	/**
	 * Checks whether the current user may access the route. `requiredRoles`
	 * contains role name strings, while `currentUser.roles` holds role
	 * objects ({id, name}), so membership is matched on `role.name`.
	 * @returns {boolean} True when access is allowed.
	 */
	const isAllowed = () => {
		if (!currentUser) {
			return false;
		}

		if (requiredRoles.length < 1) {
			return true;
		}

		const roles = currentUser.roles ?? [];
		return roles.some(role => requiredRoles.includes(role.name));
	}

	if (!isAllowed()) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ? children : <Outlet />;
}

export default ProtectedRoute
