import { GeoPoint } from "./geoPoint";

export class Marker {
	id: number;
	name: string;
	position: GeoPoint;
	species: string[];
	description?: string;
	mapMarker?: google.maps.Marker;
}