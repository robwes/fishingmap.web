import { Component, OnInit } from '@angular/core';
import { Location } from '../models/location';
import { Species } from '../models/species';
import { SpeciesService } from '../species.service';
import { LocationsService } from '../locations.service';
import { Router } from '@angular/router';

declare var google: any;

@Component({
	selector: 'app-add-new-location',
	templateUrl: './add-new-location.component.html',
	styleUrls: ['./add-new-location.component.css']
})
export class AddNewLocationComponent implements OnInit {

	selectedFeature: any;
	map: any;

	submitted = false;
	model = new Location();
	species: Species[] = [];

	styleOptions: any = {
		strokeWeight: 3,
		fillOpacity: 0.45,
		fillColor: "#0094ff",
		strokeColor: "#0518ee",
		editable: false,
		draggable: false
	};

	constructor(private locationsService: LocationsService, private speciesService: SpeciesService, private router: Router) { }

	ngOnInit() {
		this.model.species = [];
		this.map = new google.maps.Map(document.getElementById('map-panel'), {mapTypeId: google.maps.MapTypeId.HYBRID, zoom: 10});
		this.map.setCenter(new google.maps.LatLng(65.5, 21.5));
		this.map.data.setStyle(this.styleOptions);
		this.map.data.setControls(['Polygon']);
		this.map.data.setDrawingMode("Polygon");
		
		this.map.data.addListener("addfeature", this.featureAdded.bind(this));
		this.map.data.addListener("click", this.selectFeature.bind(this));

		this.speciesService.getSpecies()
			.subscribe(species => {
				this.species = species;
			});

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(position => {
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				this.map.setCenter(pos);
			});
		}
	}

	onSubmit() { 
		this.submitted = true;
		console.log("Submitted");

		this.selectedFeature.toGeoJson(geoJson => {
			this.model.points = JSON.stringify(geoJson);
			this.locationsService.addLocation(this.model)
				.subscribe(loc => {
					console.log(loc);
					this.router.navigate(["/locations"]);
				}
			);
		});
	}

	selectFeature($event) {
		if (this.selectedFeature) {
			this.map.data.overrideStyle(this.selectedFeature, {editable: false});
		}
		this.selectedFeature = $event.feature;
		this.map.data.overrideStyle(this.selectedFeature, {editable: true});
	}

	featureAdded($event) {
		console.log("Feature added");
		this.map.data.overrideStyle(this.selectedFeature, {editable: false});
		this.selectedFeature = $event.feature;
		this.map.data.overrideStyle(this.selectedFeature, {editable: true});
		this.map.data.setDrawingMode(null);
		$event.feature.toGeoJson((geoJson) => {
			console.log(JSON.stringify(geoJson));
		});
	}

	onSpeciesClicked(species: Species) {
		let index = this.model.species.indexOf(species);
		if (index > -1) {
			this.model.species.splice(index, 1);
		} else {
			this.model.species.push(species);
		}
	}
}
