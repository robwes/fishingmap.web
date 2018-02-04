import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core'
import { AppComponent } from './app.component';
import { LocationService } from './location.service';
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
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

@NgModule({
	declarations: [
		AppComponent,
		MapComponent,
		LocationsComponent,
		SpeciesComponent,
		OwnersComponent,
		LocationDetailsComponent,
		SpeciesDetailsComponent,
		OwnerDetailsComponent
	],
	imports: [
		BrowserModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyCusymbIjlWq1f0iUqIauXoYJ-PYfg530A'
		}),
		AppRoutingModule,
		HttpClientModule,
		HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false})
	],
	providers: [LocationService],
	bootstrap: [AppComponent]
})
export class AppModule { }
