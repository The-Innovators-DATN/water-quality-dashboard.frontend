"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoJsonData } from "@/lib/types/geojsonDataType";
import L from "leaflet";

const FitBounds = ({ geojsonData }: { geojsonData: GeoJsonData | null }) => {
  const map = useMap();

  useEffect(() => {
    const englandBounds = L.latLngBounds(
      [52.407999, -2.806],
      [53.407999, -1.806] 
    );

    map.fitBounds(englandBounds, { padding: [20, 20]});
    map.setMaxBounds(englandBounds);
    map.options.maxBoundsViscosity = 1.0;
  }, [geojsonData, map]);

  return null;
};

export default FitBounds;