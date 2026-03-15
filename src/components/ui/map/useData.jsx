import { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";

const useData = (
    onAddFeature,
    onFeatureClick,
    onSetGeometry
) => {
    const map = useMap();
    const [dataLayer, setDataLayer] = useState(null);

    // Keep callbacks in a ref to avoid re-binding map event listeners on every render
    const callbacksRef = useRef({ onAddFeature, onFeatureClick, onSetGeometry });
    useEffect(() => {
        callbacksRef.current = { onAddFeature, onFeatureClick, onSetGeometry };
    });

    useEffect(() => {
        if (!map) return;

        const data = new window.google.maps.Data({ map });

        // Bind events using references
        const addFeatureListener = data.addListener("addfeature", e => callbacksRef.current.onAddFeature?.(e));
        const clickListener = data.addListener("click", e => callbacksRef.current.onFeatureClick?.(e));
        const setGeometryListener = data.addListener("setgeometry", e => callbacksRef.current.onSetGeometry?.(e));
        const removeFeatureListener = data.addListener("removefeature", e => callbacksRef.current.onSetGeometry?.(e));

        setDataLayer(data);

        return () => {
            addFeatureListener.remove();
            clickListener.remove();
            setGeometryListener.remove();
            removeFeatureListener.remove();
            data.setMap(null); 
        };
    }, [map]);

    // Return the raw data layer, providing full access to native google.maps.Data API
    return dataLayer;
};

export default useData;
