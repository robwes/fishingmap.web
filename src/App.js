import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import FishingMap from './components/location/FishingMap'
import Footer from './components/Footer'
import Header from './components/Header'
import Locations from './components/location/Locations'
import LocationDetails from './components/location/LocationDetails'
import Species from './components/species/Species'
import AddLocation from './components/location/AddLocation'
import SpeciesDetails from './components/species/SpeciesDetails'
import AddSpecies from './components/species/AddSpecies'
import EditSpecies from './components/species/EditSpecies'
import EditLocation from './components/location/EditLocation'
import { CurrentUserProvider } from './hooks/CurrentUserContext'
import Login from './components/login/Login'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
	return (

		<Router>
			<div className="App">
				<CurrentUserProvider>
					<Header />

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

						<Route path="/login" element={<Login />} />
						<Route path="/" element={<FishingMap />} />
					</Routes>

					<Footer />
				</CurrentUserProvider>
			</div>
		</Router>
	);
}

export default App;
