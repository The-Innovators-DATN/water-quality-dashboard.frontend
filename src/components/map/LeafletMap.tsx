"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FitBounds from "@/components/map/FitBounds";
import GeoJSONLayer from "@/components/map/GeoJSONLayer";
import { GeoJsonData } from "@/lib/types/geojsonDataType";
import { FeatureProperties } from "@/components/map/GeoJSONLayer";

const UK_CENTER: [number, number] = [54.5, -3];
const UK_ZOOM = 6;

interface LeafletMapProps {
    geojsonData: GeoJsonData | null;
    onFeatureClick: (feature: FeatureProperties) => void;
}

export default function LeafletMap({ geojsonData, onFeatureClick }: LeafletMapProps) {
    return (
      <div className="relative w-full h-full">
        <MapContainer
          center={[52.950001, -1.150000]}
          minZoom={2}
          zoom={10}
          maxZoom={16}
          className="w-full h-full relative z-0"
          worldCopyJump={false}
          maxBoundsViscosity={1.0}
          doubleClickZoom={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
            />
            {geojsonData?.features?.length && geojsonData.features.length > 0 && (
                <GeoJSONLayer geojsonData={geojsonData} onFeatureClick={onFeatureClick} />
            )}
            {/* {geojsonData && <FitBounds geojsonData={geojsonData} />} */}
        </MapContainer>
      </div>
    );
  }
