import { Component, OnInit } from '@angular/core';
import { SpeciesService } from '../species.service';
import { Species } from '../models/species';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-species-details',
	templateUrl: './species-details.component.html',
	styleUrls: ['./species-details.component.css']
})
export class SpeciesDetailsComponent implements OnInit {

	species: Species;

	constructor(
		private route: ActivatedRoute,
		private speciesService: SpeciesService) { }

	ngOnInit() {
		const id = +this.route.snapshot.paramMap.get("id");
		this.speciesService.getSpeciesById(id).subscribe(
			s => {
				this.species = s;
			}
		)
	}

}
