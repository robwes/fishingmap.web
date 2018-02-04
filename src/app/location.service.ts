import { Injectable } from '@angular/core';
import { Location } from './models/location';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

@Injectable()
export class LocationService {

	private locationsUrl = 'api/locations';
	
	constructor(private http: HttpClient) { }

	getLocation(id: number): Observable<Location> {
		const url = `${this.locationsUrl}/${id}`;
		return this.http.get<Location>(url).pipe(
			tap(_ => this.log(`fetched location id=${id}`)),
			catchError(this.handleError<Location>(`getLocation id=${id}`))
		);
	}

	getLocations(): Observable<Location[]> {
		// const l: Location[] = [
		// 	{id: 1, name: "Stortjärn", position: {lat: 65.506850, lng: 20.735900}, species: [{ id: 1, name: "Öring" }, { id: 2, name: "Regnbåge"}, {id: 3, name: "Röding"}]},
		// 	{id: 2, name: "Pithours", position: {lat: 65.501085, lng: 20.766499}, species: [{ id: 1, name: "Öring" }, { id: 2, name: "Regnbåge"}, {id: 3, name: "Röding"}]}
		// ];
		
		// return l;
		return this.http.get<Location[]>(this.locationsUrl)
			.pipe(
				tap(locations => this.log(`fethec locations`)),
				catchError(this.handleError('getLocations', []))
			);
	}

	updateLocation(location: Location): Observable<Any> {
		return this.http.put(this.locationsUrl, location, httpOptions).pipe(
			tap(_ => this.log(`updated location id=${location.id}`)),
			catchError(this.handleError<any>('updateLocation'))
		);
	}

	private handleError<T> (operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
			console.error(error);
			
			//TODO: Logga felet

			return of(result as T);
		}
	}

	private log(msg: string) {
		console.log("LocationsService: " + msg);
	}
}
