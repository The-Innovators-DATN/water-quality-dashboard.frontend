"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";

import { GeoJsonData } from "@/lib/types/geojsonDataType";

const geoJSONStyle = {
  color: "#3388ff",
  weight: 2,
  fillColor: "#3388ff",
  fillOpacity: 0.5,
};

interface FeatureProperties {
  name?: string;
  size?: number;
  country?: string;
}

interface Feature {
  properties: FeatureProperties;
}

interface Layer extends L.Layer {
  bindPopup(content: string, options?: L.PopupOptions): this;
  getBounds(): L.LatLngBounds;
  setStyle(style: L.PathOptions): this;
}

const onEachFeature = (feature: Feature, layer: Layer) => {
  layer.on({
    mouseover: () => {
      if (feature.properties) {
        layer.bindPopup(
          `<b>${feature.properties.name || "Unknown"}</b><br/>
            <b>Size:</b> ${feature.properties.size || "N/A"} km²<br/>
            <b>Country:</b> ${feature.properties.country || "N/A"}`,
          { autoPan: false }
        ).openPopup();
      }
    },
    mouseout: () => layer.closePopup(),
  });
};

const FitBounds = ({ geojsonData }: { geojsonData: GeoJsonData | null }) => {
  const map = useMap();

  useEffect(() => {
    const worldBounds = L.latLngBounds(
      [-90, -180], 
      [90, 180]
    );
    map.fitBounds(worldBounds, { padding: [20, 20] });
    map.setMaxBounds(worldBounds);
    map.options.maxBoundsViscosity = 1.0;
  }, [geojsonData, map]);

  return null;
};

const Map = ({ geojsonData, currentLayer }: { geojsonData: GeoJsonData | null, currentLayer: string }) => {
  return (
    <MapContainer 
      center={[10.7769, 106.7009]}
      minZoom={2} 
      zoom={3} 
      maxZoom={8}  
      className="w-full h-[90%]"
      worldCopyJump={false}
      maxBoundsViscosity={1.0} 
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geojsonData && 
        <GeoJSON 
          key={currentLayer}
          data={geojsonData} 
          style={geoJSONStyle} 
          onEachFeature={onEachFeature} 
        />
      }
      <FitBounds geojsonData={geojsonData} />
    </MapContainer>
  );
};

export default Map;