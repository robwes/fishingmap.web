import { Injectable } from '@angular/core';
import { Location } from './models/location';
import { Marker } from './models/marker';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Species } from './models/species';
import { Filter } from './models/filter';

const httpOptions = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class LocationsService {

	private baseUrl = 'http://localhost:51355/api';
	private locationsUrl = this.baseUrl + '/locations';
	private markersUrl = this.locationsUrl + '/markers';

	constructor(private http: HttpClient) { }

	addLocation(location: Location): Observable<Location> {
		return this.http.post<Location>(this.locationsUrl, location, httpOptions).pipe(
			tap(_ => this.log(`added location id=${location.id}`)),
			catchError(this.handleError<Location>(`addLocation id=${location.id}`))
		);
	}

	getLocation(id: number): Observable<Location> {
		const url = `${this.locationsUrl}/${id}`;
		return this.http.get<Location>(url).pipe(
			tap(_ => this.log(`fetched location id=${id}`)),
			catchError(this.handleError<Location>(`getLocation id=${id}`))
		);
	}

	getLocations(filter?: Filter): Observable<Location[]> {
		let params = new HttpParams();
		if (filter != null) {
			params = new HttpParams()
				.set("search", filter.search)
				.set("sIds", filter.species.join())
				.set("radius", filter.radius + "")
				.set("lat", filter.lat + "")
				.set("lng", filter.lng + "")
		}

		return this.http.get<Location[]>(this.locationsUrl, { params: params })
			.pipe(
				tap(locations => this.log(`fetched locations`)),
				catchError(this.handleError('getLocations', []))
			);
	}

	getMarkers(filter?: Filter): Observable<Marker[]> {
		let params = new HttpParams();
		if (filter != null) {
			params = new HttpParams()
				.set("search", filter.search)
		}

		return this.http.get<Marker[]>(this.markersUrl, { params: params }).pipe(
			tap(_ => this.log(`fetched markers`)),
			catchError(this.handleError('getMarkers', []))
		);

		/*
		if (filter != null) {
			params = new HttpParams()
				.set("search", filter.search)
				.set("radius", filter.radius + "")
				.set("lat", filter.lat + "")
				.set("lng", filter.lng + "")

				filter.species.forEach(s => {
					params = params.append("sIds", s + "");
				});
		}

		return this.http.get<Marker[]>(this.markersUrl, { params: params })
			.pipe(
				tap(markers => this.log(`fetched markers`)),
				catchError(this.handleError('getMarkers', []))
			);
			*/
	}

	updateLocation(location: Location): Observable<any> {
		const url = `${this.locationsUrl}/${location.id}`;
		return this.http.put(url, location, httpOptions).pipe(
			tap(_ => this.log(`updated location id=${location.id}`)),
			catchError(this.handleError<any>('updateLocation'))
		);
	}

	private handleError<T>(operation = 'operation', result?: T) {
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
