import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Species } from './models/species';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class SpeciesService {

	private baseUrl = 'http://localhost:51355/api';
	private speciessUrl = this.baseUrl + '/species';

	constructor(private http: HttpClient) { }

	addSpecies(species: Species): Observable<Species> {
		return this.http.post<Species>(this.speciessUrl, species, httpOptions).pipe(
			tap(_ => this.log(`Added new species ${species.id}`))
		);
	}

	updateSpecies(species: Species): Observable<Species> {
		let url = `${this.speciessUrl}/${species.id}`;
		return this.http.put<Species>(url, species, httpOptions).pipe(
			tap(_ => this.log(`Updated species ${species.id}`))
		);
	}

	getSpecies(): Observable<Species[]> {
		return this.http.get<Species[]>(this.speciessUrl).pipe(
			tap(species => this.log(`fetched ${species.length} species`))
		);
	}

	getSpeciesById(id: number): Observable<Species> {
		let url = `${this.speciessUrl}/${id}`;
		return this.http.get<Species>(url).pipe(
			tap(_ => {this.log(`fetched species ${id}`)})
		);
	}

	private log(msg: string) {
		console.log("SpeciesService: " + msg);
	}
}
