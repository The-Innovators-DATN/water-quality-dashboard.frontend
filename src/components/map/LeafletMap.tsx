"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FitBounds from "@/components/map/FitBounds";
import GeoJSONLayer from "@/components/map/GeoJSONLayer";
import { GeoJsonData } from "@/lib/types/geojsonDataType";

interface LeafletMapProps {
    geojsonData: GeoJsonData | null;
    onFeatureClick: (feature: any) => void;
}

export default function LeafletMap({ geojsonData, onFeatureClick }: LeafletMapProps) {
    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={[10.7769, 106.7009]}
                minZoom={2}
                zoom={3}
                maxZoom={16}
                className="w-full h-full relative z-0"
                worldCopyJump={false}
                maxBoundsViscosity={1.0}
                doubleClickZoom={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {geojsonData && <GeoJSONLayer geojsonData={geojsonData} onFeatureClick={onFeatureClick} />}
                <FitBounds geojsonData={geojsonData} />
            </MapContainer>
        </div>
    );
}
