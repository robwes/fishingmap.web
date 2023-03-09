import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { CurrentUserProvider } from './context/CurrentUserContext';
import Login from './pages/login/Login';
import ProtectedRoute from './components/route/ProtectedRoute';
import EditUser from './pages/user/edit/EditUser';
import ProtectedRouteIsLoggedInUser from './components/route/ProtectedRouteCurrentUser';
import LandingPage from './pages/landingPage/LandingPage';
import ScrollToTop from './components/route/ScrollToTop';

function App() {
	return (
		<Router>
			<div className="App">
				<CurrentUserProvider>
					<Header />
					<ScrollToTop />
					<Routes>
						<Route exact path="/locations" element={<Locations />} />
						<Route exact path="/locations/:id" element={<LocationDetails />} />
						<Route exact path="/species" element={<Species />} />
						<Route exact path="/species/:id" element={<SpeciesDetails />} />

						<Route element={<ProtectedRoute />}>
							<Route path="/locations/add" element={<AddLocation />} />
							<Route path="/locations/:id/edit" element={<EditLocation />} />
							<Route path="/species/add" element={<AddSpecies />} />
							<Route path="/species/:id/edit" element={<EditSpecies />} />

						</Route>

						<Route element={<ProtectedRouteIsLoggedInUser />}>
							<Route path='/users/:id/edit' element={<EditUser />} />
						</Route>

						<Route path="/login" element={<Login />} />
						<Route path="/map" element={<FishingMap />} />
						<Route path="/" element={<LandingPage />} />
					</Routes>

					<Footer />
				</CurrentUserProvider>
			</div>
		</Router>
	);
}

export default App;
