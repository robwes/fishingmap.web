import React, { useState, useEffect } from 'react';
import { Data } from '@react-google-maps/api';
import { useField } from 'formik';
import Map from '../map/Map';
import Label from './Label';
import Error from './Error';
import './MapInput.scss';

const mapStyle = {
    width: '100%',
    height: '650px'
};

function MapInput({ label, options, className, ...props }) {

	// eslint-disable-next-line
	const [field, meta, helpers] = useField(props);

	const { value } = meta;
	const { setValue } = helpers;

	const [dataLayer, setDataLayer] = useState(null);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		if (dataLayer && value) {
			dataLayer.addGeoJson(value);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataLayer])

	const handleLoad = data => {
		data.setStyle({
			fillColor: "#4285f4",
			strokeColor: "#4285f4",
			strokeWeight: 5,
			draggable: true,
			editable: true
		});

		const topLeftPos = window.google ? window.google.maps.ControlPosition.TOP_LEFT : 1;
		data.setControlPosition(topLeftPos);
		data.setControls(["Polygon"]);
		data.setDrawingMode("Polygon");

		setDataLayer(data);
	}

	const handleAddFeature = event => {
		dataLayer.setDrawingMode(null);

		dataLayer.toGeoJson(geoJson => {
			setValue(geoJson);
		});
	}

	const handleMouseDown = event => {
		setIsDragging(true);
	}

	const handleMouseUp = event => {
		setIsDragging(false);
	}

	const handleRemoveFeature = event => {
		dataLayer.remove(event.feature);

		dataLayer.toGeoJson(geoJson => {
			setValue(geoJson);
		});
	}

	const handleSetGeometry = event => {
		if (!isDragging) {
			dataLayer.toGeoJson(geoJson => {
				setValue(geoJson);
			});
		}
	}

	return (
		<div className={className}>

			{label &&
				<Label htmlFor={props.id || props.name}>{label}</Label>
			}

			<div className="map-input">
				<Map
					center={options.center}
					zoom={options.zoom}
					mapStyle={mapStyle}
					fullscreenControl={false}
					streetViewControl={false}
					{...props}
				>
					<Data
						onLoad={handleLoad}
						onAddFeature={handleAddFeature}
						onSetGeometry={handleSetGeometry}
						onMouseDown={handleMouseDown}
						onMouseUp={handleMouseUp}
						onDblClick={handleRemoveFeature}
					/>
				</Map>
			</div>
			{meta.error ? (
				<Error message={meta.error} />
			) : null}
		</div>
	)
}

export default MapInput
