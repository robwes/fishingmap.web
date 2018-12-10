import { GeoPoint } from "./geoPoint";
import { Species } from "./species";

export class LocationMarker {
	id: number;
	name: string;
	description: string;
	position: GeoPoint;
	species: Species[];
}