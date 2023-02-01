import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../context/CurrentUserContext';

function ProtectedRoute({ redirectPath = "/", requiredRoles = [], children }) {

	const [currentUser] = useCurrentUser();

	const isAllowed = () => {
		if (currentUser) {
			if (requiredRoles.length < 1) {
				return true;
			} 
			else if (currentUser.roles) {
				const { roles } = currentUser;
				
				for (let i = 0; i < roles.length; i++) {
					if (requiredRoles.includes(roles[i])) {
						return true;
					}
				}
			}
		}

		return false;
	}

	if (!isAllowed()) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ? children : <Outlet />;
}

export default ProtectedRoute