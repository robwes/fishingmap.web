import { Component, OnInit } from '@angular/core';
import { SpeciesService } from '../species.service';
import { Species } from '../models/species';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-edit-species',
	templateUrl: './edit-species.component.html',
	styleUrls: ['./edit-species.component.css']
})
export class EditSpeciesComponent implements OnInit {

	model = new Species();

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private speciesService: SpeciesService) { }

	ngOnInit() {
		const id = +this.route.snapshot.paramMap.get("id");
		this.speciesService.getSpeciesById(id).subscribe(
			s => {
				this.model = s;
			}
		);
	}

	onSubmit() {
		this.speciesService.updateSpecies(this.model).subscribe(
			s => {
				this.router.navigate([`/species/${s.id}`]);
			}
		);
	}
}