"use client";

import { useState, useEffect, useCallback } from "react";
import { Map, List } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { GeoJsonData } from "@/lib/types/geojsonDataType";
import FilterSidebar from "@/components/filters/FilterSidebar";

interface FeatureProperties {
  name?: string;
  continent?: string;
  region?: string;
  size?: number;
  country?: string;
  id?: string;
  coordinates?: string;
}

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  const router = useRouter();
  const [currentLayer, setCurrentLayer] = useState<string>("");
  const [geojsonData, setGeojsonData] = useState<GeoJsonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGeoJson = useCallback(async (layer: string) => {
    if (!layer) {
      setGeojsonData(null);
      return;
    }

    setIsLoading(true);

    const cachedData = sessionStorage.getItem(`geojson_${layer}`);
    if (cachedData) {
      setGeojsonData(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/geojson/${layer}.json`);
      if (!response.ok) throw new Error("Failed to fetch GeoJSON");

      const data = await response.json();
      sessionStorage.setItem(`geojson_${layer}`, JSON.stringify(data));

      setGeojsonData(data);
    } catch (error) {
      console.error(`Error loading GeoJSON (${layer}):`, error);
      setGeojsonData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGeoJson(currentLayer);
  }, [currentLayer, fetchGeoJson]);

  const handleFeatureClick = (feature: FeatureProperties) => {
    const stationId = feature.id || `station-${Math.floor(Math.random() * 1000)}`;
    router.push(`/dashboard/${stationId}`);
  };

  return (
    <div className="w-full h-full flex">
      <div className="relative w-full h-full flex flex-col space-y-2 p-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-4 py-1 rounded-lg bg-blue-500 text-white shadow">
              <Map size={18} />
              <span>Bản đồ</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-1 rounded-lg border">
              <List size={18} />
              <span>Danh sách</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {[
              { label: "Trạm", value: "" },
              { label: "Lưu vực", value: "catchments" },
              { label: "Quốc gia", value: "countries" },
            ].map(({ label, value }) => (
              <button
                key={value}
                className={`px-4 py-1 rounded-lg border transition-all duration-150 ${
                  currentLayer === value ? "bg-blue-500 text-white shadow" : ""
                }`}
                onClick={() => setCurrentLayer(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-md">
          {!isLoading && (
            <LeafletMap geojsonData={geojsonData} onFeatureClick={handleFeatureClick} />
          )}
        </div>
      </div>

      <FilterSidebar></FilterSidebar>
    </div>
  );
}
