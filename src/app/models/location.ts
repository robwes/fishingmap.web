import { GeoPoint } from "./geoPoint";
import { Species } from "./species";

export class Location {
	id?: number;
	name?: string;
	position?: GeoPoint;
	species?: Species[];
	points?: string;
	description?: string;
	fishingPermitInfo?: string;
	rules?: string;
	website?: string;
	averageDepth?: number;
	maxDepth?: number;
	owner?: string;
}