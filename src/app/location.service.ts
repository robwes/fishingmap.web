import { Injectable } from '@angular/core';
import { Location } from './models/location';

@Injectable()
export class LocationService {

	constructor() { }

	getLocations(): Location[] {
		const l: Location[] = [
			{id: 1, name: "Stortjärn", position: {lat: 65.506850, lng: 20.735900}, species: [{ id: 1, name: "Öring" }, { id: 2, name: "Regnbåge"}, {id: 3, name: "Röding"}]},
			{id: 2, name: "Pithours", position: {lat: 65.501085, lng: 20.766499}, species: [{ id: 1, name: "Öring" }, { id: 2, name: "Regnbåge"}, {id: 3, name: "Röding"}]}
		];
		
		return l;
	}
}
