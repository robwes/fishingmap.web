import { Component, OnInit, Input } from '@angular/core';
import { Location } from '../models/location';

@Component({
	selector: 'app-location-list-item',
	templateUrl: './location-list-item.component.html',
	styleUrls: ['./location-list-item.component.css']
})
export class LocationListItemComponent implements OnInit {

	@Input()
	location: Location;

	constructor() { }

	ngOnInit() {
	}

}
