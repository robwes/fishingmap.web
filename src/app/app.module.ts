import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { LocationsService } from './locations.service';
import 'bootstrap';
import { AppRoutingModule } from './/app-routing.module';
import { MapComponent } from './map/map.component';
import { LocationsComponent } from './locations/locations.component';
import { SpeciesComponent } from './species/species.component';
import { OwnersComponent } from './owners/owners.component';
import { LocationDetailsComponent } from './location-details/location-details.component';
import { SpeciesDetailsComponent } from './species-details/species-details.component';
import { OwnerDetailsComponent } from './owner-details/owner-details.component';
import { HttpClientModule } from '@angular/common/http';
import { LocationListItemComponent } from './location-list-item/location-list-item.component';
import { AddNewLocationComponent } from './add-new-location/add-new-location.component';
import { SpeciesService } from './species.service';
import { RangeComponent } from './range/range.component';
import { SearchComponent } from './search/search.component';
import { SpeciesListItemComponent } from './species-list-item/species-list-item.component';
import { AddNewSpeciesComponent } from './add-new-species/add-new-species.component';
import { EditSpeciesComponent } from './edit-species/edit-species.component';
import { EditLocationComponent } from './edit-location/edit-location.component';
import { Autosize } from './auto-size.directive';

@NgModule({
	declarations: [
		AppComponent,
		MapComponent,
		LocationsComponent,
		SpeciesComponent,
		OwnersComponent,
		LocationDetailsComponent,
		SpeciesDetailsComponent,
		OwnerDetailsComponent,
		LocationListItemComponent,
		AddNewLocationComponent,
		RangeComponent,
		SearchComponent,
		SpeciesListItemComponent,
		AddNewSpeciesComponent,
		EditSpeciesComponent,
		EditLocationComponent,
		Autosize
	],
	imports: [
		BrowserModule,
		FormsModule,
		AppRoutingModule,
		HttpClientModule
	],
	providers: [LocationsService, SpeciesService],
	bootstrap: [AppComponent]
})
export class AppModule { }
