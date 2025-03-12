"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { GeoJsonData } from "@/lib/types/geojsonDataType";

const FitBounds = ({ geojsonData }: { geojsonData: GeoJsonData | null }) => {
  const map = useMap();

  useEffect(() => {
    const worldBounds = L.latLngBounds([-90, -180], [90, 180]);
    map.fitBounds(worldBounds, { padding: [20, 20] });
    map.setMaxBounds(worldBounds);
    map.options.maxBoundsViscosity = 1.0;
  }, [geojsonData, map]);

  return null;
};

export default FitBounds;
