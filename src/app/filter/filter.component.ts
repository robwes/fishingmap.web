import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { Species } from "../models/species";
import { SpeciesService } from "../species.service";

@Component({
	selector: "app-filter",
	templateUrl: "./filter.component.html",
	styleUrls: ["./filter.component.css"]
})
export class FilterComponent implements OnInit {
	species: Species[];

	selectedSpecies: Species[];
	radius: number;

	@Output()
	public radiusChanged = new EventEmitter<number>();

	constructor(private speciesService: SpeciesService) { }

	ngOnInit() {
		this.selectedSpecies = [];
		this.speciesService.getSpecies()
			.subscribe(s => {
				this.species = s;
			});
	}

	onSpeciesClicked(species: Species) {
		let index = this.selectedSpecies.indexOf(species);
		if (index > -1) {
			this.selectedSpecies.splice(index, 1);
		} else {
			this.selectedSpecies.push(species);
		}
	}

	onRangeChanged(radius: number) {
		this.radius = radius;
		this.radiusChanged.emit(this.radius);
	}
}
