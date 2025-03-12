"use client";

import dynamic from "next/dynamic";
import { GeoJsonData } from "@/lib/types/geojsonDataType";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface MapViewProps {
    geojsonData: GeoJsonData | null;
    onFeatureClick: (feature: any) => void;
}

export default function MapView({ geojsonData, onFeatureClick }: MapViewProps) {
    return <LeafletMap geojsonData={geojsonData} onFeatureClick={onFeatureClick} />;
}
