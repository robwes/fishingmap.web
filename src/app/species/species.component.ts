import { Component, OnInit } from '@angular/core';
import { Species } from '../models/species';
import { SpeciesService } from '../species.service';

@Component({
	selector: 'app-species',
	templateUrl: './species.component.html',
	styleUrls: ['./species.component.css']
})
export class SpeciesComponent implements OnInit {

	species: Species[];

	constructor(private speciesService: SpeciesService) { }

	ngOnInit() {
		this.getSpecies();
	}

	getSpecies() {
		this.speciesService.getSpecies()
			.subscribe(s => {
				this.species = s;
			});
	}

}
