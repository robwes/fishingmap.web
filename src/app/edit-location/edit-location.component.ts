import { Component, OnInit } from '@angular/core';
import { LocationsService } from '../locations.service';
import { SpeciesService } from '../species.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Species } from '../models/species';
import { Location } from '../models/location';

@Component({
	selector: 'app-edit-location',
	templateUrl: './edit-location.component.html',
	styleUrls: ['./edit-location.component.css']
})
export class EditLocationComponent implements OnInit {

	selectedFeature: any;
	map: any;

	submitted = false;
	model = null;
	species: Species[] = [];

	styleOptions: any = {
		strokeWeight: 3,
		fillOpacity: 0.45,
		fillColor: "#0094ff",
		strokeColor: "#0518ee",
		editable: false,
		draggable: false
	};

	constructor(private locationsService: LocationsService, private speciesService: SpeciesService, private route: ActivatedRoute, private router: Router) { }

	ngOnInit() {
		const id = +this.route.snapshot.paramMap.get("id");

		this.locationsService.getLocation(id)
			.subscribe(l => {
				this.model = l;

				if (!this.model.species) {
					this.model.species = [];
				}

				this.map = new google.maps.Map(document.getElementById('map-panel'), { mapTypeId: google.maps.MapTypeId.HYBRID, zoom: 13 });
				this.map.data.setStyle(this.styleOptions);
				this.map.setCenter(new google.maps.LatLng(this.model.position.latitude, this.model.position.longitude));
		
				this.map.data.setControls(['Polygon']);
				this.map.data.setDrawingMode("Polygon");
		
				this.map.data.addListener("addfeature", this.featureAdded.bind(this));
				this.map.data.addListener("click", this.selectFeature.bind(this));

				let geoJ = JSON.parse(this.model.points);
				this.map.data.addGeoJson(geoJ);
			});

		this.speciesService.getSpecies()
			.subscribe(species => {
				this.species = species;
			});
	}

	onSubmit() {
		this.submitted = true;
		console.log("Submitted");

		this.selectedFeature.toGeoJson(geoJson => {
			this.model.points = JSON.stringify(geoJson);
			this.locationsService.updateLocation(this.model)
				.subscribe(loc => {
					console.log(loc);
					this.router.navigate([`/locations/${loc.id}`]);
				});
		});
	}

	selectFeature($event) {
		if (this.selectedFeature) {
			this.map.data.overrideStyle(this.selectedFeature, { editable: false });
		}
		this.selectedFeature = $event.feature;
		this.map.data.overrideStyle(this.selectedFeature, { editable: true });
	}

	featureAdded($event) {
		console.log("Feature added");
		this.map.data.overrideStyle(this.selectedFeature, { editable: false });
		this.selectedFeature = $event.feature;
		this.map.data.overrideStyle(this.selectedFeature, { editable: true });
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

	hasSpecies(species: Species) {
		if (this.model.species) {
			return this.model.species.some(s => s.id == species.id);
		}
		return false;
	}
}
