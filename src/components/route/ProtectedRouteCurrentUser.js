import React from 'react';
import { useParams } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../context/CurrentUserContext';

function ProtectedRouteIsLoggedInUser({ redirectPath = "/", children }) {

    const { id } = useParams();
	const [currentUser] = useCurrentUser();

	const isAllowed = () => {
		if (!currentUser) {
			return false;
		}
		
		const userId = currentUser?.id + "";
        return userId === id;
	}

	if (!isAllowed()) {
		return <Navigate to={redirectPath} replace />;
	}

    return children ? children : <Outlet />;
}

export default ProtectedRouteIsLoggedInUser