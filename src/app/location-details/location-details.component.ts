import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from '../location.service';

@Component({
	selector: 'app-location-details',
	templateUrl: './location-details.component.html',
	styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private locationService: LocationService
	) { }

	ngOnInit() {
		const id = +this.route.snapshot.paramMap.get("id");
	}

}
