import { Component, OnInit } from '@angular/core';
import { SpeciesService } from './species.service';
import { Species } from './models/species';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'app';
	species: Species[];

	constructor(private speciesService: SpeciesService) {}

	ngOnInit() {
		this.speciesService.getSpecies()
			.subscribe(species => {
				this.species = species;
			}
		);
	}
}
