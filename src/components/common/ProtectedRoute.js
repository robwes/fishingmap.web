import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/CurrentUserContext';

function ProtectedRoute({ redirectPath = "/", requiredRoles = [], children }) {

	//const [isAllowed, setIsAllowed] = useState(false);
	const [currentUser] = useCurrentUser();

	// useEffect(() => {
	// 	if (currentUser) {
	// 		if (requiredRoles.length < 1) {
	// 			setIsAllowed(true);
	// 		} 
	// 		else if (currentUser.roles) {
	// 			const { roles } = currentUser;
				
	// 			for (let i = 0; i < roles.length; i++) {
	// 				if (requiredRoles.includes(roles[i])) {
	// 					setIsAllowed(true);
	// 					break;
	// 				}
	// 			}
	// 		}
	// 	}
	// }, [])

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

	debugger;
	if (!isAllowed()) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ? children : <Outlet />;
}

export default ProtectedRoute