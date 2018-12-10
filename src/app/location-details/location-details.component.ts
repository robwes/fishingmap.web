import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationsService } from '../locations.service';
import { Location } from '../models/location';

declare var google: any;

@Component({
	selector: 'app-location-details',
	templateUrl: './location-details.component.html',
	styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit {

	styleOptions: any = {
		strokeWeight: 3,
		fillOpacity: 0.45,
		fillColor: "#0094ff",
		strokeColor: "#0518ee",
		editable: false,
		draggable: false
	};

	//@ViewChild(DataLayer) dataLayer: DataLayer;
	map: any;

	location: Location;
	id: number;
	constructor(
		private route: ActivatedRoute,
		private locationsService: LocationsService
	) { }

	ngOnInit() {
		const id = +this.route.snapshot.paramMap.get("id");
		this.locationsService.getLocation(id).
			subscribe(location => {
				this.location = location;
				this.map = new google.maps.Map(document.getElementById('map-panel'), {mapTypeId: google.maps.MapTypeId.HYBRID, zoom: 13});
				this.map.data.setStyle(this.styleOptions);
				this.map.setCenter(new google.maps.LatLng(location.position.latitude, location.position.longitude));

				let geoJ = JSON.parse(location.points);
				this.map.data.addGeoJson(geoJ);
			});
	}

	getLocation() {
		const id = +this.route.snapshot.paramMap.get("id");
		this.locationsService.getLocation(id).
			subscribe(location => {
				this.location = location;
				this.map.loadGeoJson(location.points);
			});
	}

}
