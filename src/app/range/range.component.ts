import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-range',
	templateUrl: './range.component.html',
	styleUrls: ['./range.component.css']
})
export class RangeComponent implements OnInit {

	@Input()
	label: string;
	@Input()
	min: number;
	@Input()
	max: number;
	@Input()
	unit: string;

	withinRange: number;
	@Output()
	withinRangeChange = new EventEmitter<number>();
	
	infinity: number;

	constructor() { }

	ngOnInit() {
		this.infinity = this.min - 1;
		this.withinRange = this.infinity;
	}

	onRangeChanged($event: any) {
		this.withinRangeChange.emit(this.withinRange);
	}

}
