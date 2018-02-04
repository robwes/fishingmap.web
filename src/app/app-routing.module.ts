import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { LocationsComponent } from './locations/locations.component';
import { SpeciesComponent } from './species/species.component';
import { OwnersComponent } from './owners/owners.component';
import { LocationDetailsComponent } from './location-details/location-details.component';
import { SpeciesDetailsComponent } from './species-details/species-details.component';
import { OwnerDetailsComponent } from './owner-details/owner-details.component';

const routes: Routes = [
	{ path: 'map', component: MapComponent},
	{ path: 'locations', component: LocationsComponent},
	{ path: 'locations/:id', component: LocationDetailsComponent},
	{ path: 'species', component: SpeciesComponent},
	{ path: 'species/:id', component: SpeciesDetailsComponent},
	{ path: 'owners', component: OwnersComponent},
	{ path: 'owner/:id', component: OwnerDetailsComponent},
	{ path: '', redirectTo: '/map', pathMatch: 'full'}
];

@NgModule({
	exports: [ RouterModule ],
	imports: [ RouterModule.forRoot(routes)]
})
export class AppRoutingModule {
	
}
