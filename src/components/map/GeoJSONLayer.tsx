"use client";

import { GeoJSON } from "react-leaflet";
import { Layer } from "leaflet";
import { GeoJsonData } from "@/lib/types/geojsonDataType";

export interface FeatureProperties {
  name?: string;
  continent?: string;
  region?: string;
  size?: number;
  country?: string;
}

interface Feature {
  properties: FeatureProperties;
}

const geoJSONStyle = {
  color: "#3388ff",
  weight: 2,
  fillColor: "#3388ff",
  fillOpacity: 0.5,
};

const GeoJSONLayer = ({
  geojsonData,
  onFeatureClick,
}: {
  geojsonData: GeoJsonData | null;
  onFeatureClick: (feature: FeatureProperties) => void;
}) => {

  const onEachFeature = (feature: Feature, layer: Layer) => {
    layer.on({
      click: () => onFeatureClick(feature.properties),
    });
  };

  return (
    <>
      {geojsonData && <GeoJSON key={JSON.stringify(geojsonData)} data={geojsonData} style={geoJSONStyle} onEachFeature={onEachFeature} />}
    </>
  );
};

export default GeoJSONLayer;
