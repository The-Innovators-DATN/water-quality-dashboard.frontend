"use client";

import dynamic from "next/dynamic";
import { GeoJsonData } from "@/lib/types/geojsonDataType";
import { FeatureProperties } from "@/components/map/GeoJSONLayer";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface MapViewProps {
    geojsonData: GeoJsonData | null;
    onFeatureClick: (feature: FeatureProperties) => void;
    isLoading: boolean;
}

export default function MapView({ geojsonData, onFeatureClick, isLoading }: MapViewProps) {
    if (isLoading) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    return <LeafletMap geojsonData={geojsonData} onFeatureClick={onFeatureClick} />;
}
