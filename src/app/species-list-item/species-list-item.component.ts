import { Component, OnInit, Input } from '@angular/core';
import { Species } from '../models/species';

@Component({
	selector: 'app-species-list-item',
	templateUrl: './species-list-item.component.html',
	styleUrls: ['./species-list-item.component.css']
})
export class SpeciesListItemComponent implements OnInit {

	@Input()
	species: Species

	constructor() { }

	ngOnInit() {
	}

}
