import { Component, OnInit } from '@angular/core';
import { Species } from '../models/species';
import { SpeciesService } from '../species.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-add-new-species',
	templateUrl: './add-new-species.component.html',
	styleUrls: ['./add-new-species.component.css']
})
export class AddNewSpeciesComponent implements OnInit {

	model = new Species();

	constructor(private speciesService: SpeciesService, private router: Router) { }

	ngOnInit() {
	}

	onSubmit() {
		this.speciesService.addSpecies(this.model).subscribe(s => {
			this.router.navigate(["/species"]);
		});
	}

}
