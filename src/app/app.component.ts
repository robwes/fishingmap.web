import { Component } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Location } from './models/location';
import { LocationService } from './location.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'app';
	locations: Location[];

	constructor(private locationService: LocationService) {}

	ngOnInit() {
		this.locations = this.locationService.getLocations();
	}
}
