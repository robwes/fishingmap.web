import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import FishingMap from './pages/map/FishingMap';
import Footer from './components/ui/footer/Footer';
import Header from './components/ui/header/Header';
import Locations from './pages/location/list/Locations';
import LocationDetails from './pages/location/details/LocationDetails';
import Species from './pages/species/list/Species';
import AddLocation from './pages/location/add/AddLocation';
import SpeciesDetails from './pages/species/details/SpeciesDetails';
import AddSpecies from './pages/species/add/AddSpecies';
import EditSpecies from './pages/species/edit/EditSpecies';
import EditLocation from './pages/location/edit/EditLocation';
import { CurrentUserProvider } from '@/shared/context/CurrentUserContext';
import { ToastProvider } from '@/shared/context/ToastContext';
import Login from '@/features/auth/Login';
import ProtectedRoute from './components/route/ProtectedRoute';
import EditUser from '@/features/users/edit/EditUser';
import ProtectedRouteIsLoggedInUser from './components/route/ProtectedRouteCurrentUser';
import LandingPage from './pages/landingPage/LandingPage';
import ScrollToTop from './components/route/ScrollToTop';
import Permits from './pages/permit/list/Permits';
import PermitDetails from './pages/permit/details/PermitDetails';
import AddPermit from './pages/permit/add/AddPermit';
import EditPermit from './pages/permit/edit/EditPermit';

function App() {
	return (
		<Router>
			<div className="App">
				<CurrentUserProvider>
					<ToastProvider>
					<Header />
					<ScrollToTop />
					<APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
						<Routes>
							<Route path="/locations" element={<Locations />} />
							<Route path="/locations/:id" element={<LocationDetails />} />
							<Route path="/species" element={<Species />} />
							<Route path="/species/:id" element={<SpeciesDetails />} />
							<Route path="/permits" element={<Permits />} />
							<Route path="/permits/:id" element={<PermitDetails />} />

							<Route element={<ProtectedRoute />}>
								<Route path="/locations/add" element={<AddLocation />} />
								<Route path="/locations/:id/edit" element={<EditLocation />} />
								<Route path="/species/add" element={<AddSpecies />} />
								<Route path="/species/:id/edit" element={<EditSpecies />} />
								<Route path="/permits/add" element={<AddPermit />} />
								<Route path="/permits/:id/edit" element={<EditPermit />} />
							</Route>

							<Route element={<ProtectedRouteIsLoggedInUser />}>
								<Route path='/users/:id/edit' element={<EditUser />} />
							</Route>

							<Route path="/login" element={<Login />} />
							<Route path="/map" element={<FishingMap />} />
							<Route path="/" element={<LandingPage />} />
						</Routes>
					</APIProvider>

					<Footer />
					</ToastProvider>
				</CurrentUserProvider>
			</div>
		</Router>
	);
}

export default App;
