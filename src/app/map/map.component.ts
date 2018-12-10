import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationsService } from '../locations.service';
import { Location } from '../models/location';
import { Marker } from '../models/marker';
import { SpeciesService } from '../species.service';
import { Species } from '../models/species';
import { Filter } from '../models/filter';
import { SearchComponent } from '../search/search.component';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

	markers: Marker[];
	species: Species[];
	map: any;
	searchCirce: google.maps.Circle;

	@ViewChild(SearchComponent)
	search: SearchComponent;

	constructor(private locationsService: LocationsService, private speciesService: SpeciesService) { }

	ngOnInit() {
		var _this = this;
		this.map = new google.maps.Map(document.getElementById('map-panel'), { center: { lat: 65, lng: 22 }, mapTypeId: google.maps.MapTypeId.HYBRID, zoom: 8 });

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(position => {

				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				_this.searchCirce = new google.maps.Circle({
					fillColor: "#0094ff",
					strokeColor: "#0518ee",
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillOpacity: 0.35,
					map: _this.map,
					center: pos,
					radius: 0,
					draggable: true
				  });
				_this.map.setCenter(pos);
			});
		}

		this.getSpecies();
		this.getMarkers();
	}

	getSpecies() {
		this.speciesService.getSpecies()
			.subscribe(species => {
				this.species = species;
			});
	}

	getMarkers(filter?: Filter) {
		this.locationsService.getMarkers(filter)
			.subscribe(markers => {
				this.markers = markers;
				this.markers.forEach(m => {
					var contentString = `<div><h5 class='text-center'><a href='/locations/${m.id}'>${m.name}</a></h5>`;
					if (m.description) {
						contentString += `<p>${m.description}</p>`
					}
					contentString += `<ul class='list-inline'>`;
					m.species.forEach(s => {
						contentString += `<li class='list-inline-item mb-0'>${s}</li>`;
					});

					contentString += "</ul></div>"

					var infowindow = new google.maps.InfoWindow({
						content: contentString
					});

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(m.position.latitude, m.position.longitude),
						map: this.map,
						title: m.name
					  });		  

					marker.addListener("click", () => {
						infowindow.open(this.map, marker)
					});
				});
			});
	}

	onRadiusChanged(radius: number) {
		this.searchCirce.setRadius(radius * 1000);
	}

	onNewSearch(filter: Filter) {
		console.log(filter);
		if (this.searchCirce) {
			var pos = this.searchCirce.getCenter();
			filter.lat = pos.lat();
			filter.lng = pos.lng();
		}
		this.getMarkers(filter);
	}
}