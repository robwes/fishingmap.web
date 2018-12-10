import { Component, OnInit } from '@angular/core';
import { Location } from '../models/location';
import { LocationsService } from '../locations.service';

@Component({
	selector: 'app-locations',
	templateUrl: './locations.component.html',
	styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {

	locations: Location[];

	constructor(private locationsService: LocationsService) { }

	ngOnInit() {
		this.getLocations();
	}

	getLocations() {
		this.locationsService.getLocations()
			.subscribe(locations => {
				this.locations = locations;
			});
	}
}
