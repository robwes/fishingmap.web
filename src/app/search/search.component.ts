import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { SpeciesService } from '../species.service';
import { Species } from '../models/species';
import { Filter } from '../models/filter';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

	filterVisibile: Boolean;
	searchVisible: Boolean;

	species: Species[];
	searchString: string;
	selectedSpecies: Species[];

	radius: number;

	@Output()
	public newSearch: EventEmitter<Filter> = new EventEmitter<Filter>();

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

	onSubmit() {
		let filter: Filter = {
			search: this.searchString,
			species: this.selectedSpecies.map(s => s.id),
			radius: this.radius
		}
		this.newSearch.emit(filter);
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

	toggleSearchVisibility() {
		this.searchVisible = !this.searchVisible;
		if (!this.searchVisible) {
			this.filterVisibile = false;
		}
	}

	toggleFilterVisibility() {
		this.filterVisibile = !this.filterVisibile;
	}
}
