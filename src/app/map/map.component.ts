import { Component, OnInit } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { LocationService } from '../location.service';
import { Location } from '../models/location';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

	locations: Location[];

	constructor(private locationService: LocationService) { }

	ngOnInit() {
		this.locationService.getLocations()
			.subscribe(locations => {
				this.locations = locations;
			});
	}

}