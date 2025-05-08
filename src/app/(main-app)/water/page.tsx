"use client";

import { useState, useEffect, useCallback } from "react";
import { Map, List } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { GeoJsonData } from "@/lib/types/geojsonDataType";
import { convertStationsToGeoJson } from "@/lib/utils/convertStationsToGeoJson";
import FilterSidebar from "@/components/filters/FilterSidebar";
import StationTable from "@/components/tables/StationTable";


const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
});

const layerOptions = [
  { label: "Trạm", value: "station" },
  { label: "Lưu vực", value: "catchment" },
  { label: "Lưu vực sông", value: "river_basin" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [geojsonData, setGeojsonData] = useState<GeoJsonData | null>(null);
  const [currentLayer, setCurrentLayer] = useState<string>("station");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const fetchGeoData = useCallback(async () => {
    setIsLoading(true);

    try {
      if (currentLayer === "station") {
        const response = await fetch("/api/dashboard/stations", {
          credentials: "include",
        });
        const result = await response.json();
        const geojson = convertStationsToGeoJson(result.stations || []);
        setGeojsonData(geojson);
      } else {
        const response = await fetch(`/geojson/${currentLayer}.json`);
        const result = await response.json();
        setGeojsonData(result);
      }
    } catch (error) {
      console.error("Failed to load geo data:", error);
      setGeojsonData(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayer]);

  useEffect(() => {
    fetchGeoData();
  }, [fetchGeoData]);

  const handleFeatureClick = (feature: any) => {
    const id = feature.id || feature.properties?.id;
    if (!id) return;
    router.push(`/water/${currentLayer}/${id}`);
  };

  return (
    <div className="w-full h-full flex">
      <div className="relative w-full h-full flex flex-col space-y-2 p-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-4 py-1 rounded-lg transition-all ${
              viewMode === "map" ? "bg-blue-500 text-white shadow" : "border"
            }`}
          >
            <Map size={18} />
            <span>Bản đồ</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-1 rounded-lg transition-all ${
              viewMode === "list" ? "bg-blue-500 text-white shadow" : "border"
            }`}
          >
            <List size={18} />
            <span>Danh sách</span>
          </button>
        </div>


          <div className="flex items-center gap-1">
            {layerOptions.map(({ label, value }) => (
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

        <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-md bg-white">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-500 text-sm font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : viewMode === "map" ? (
            <LeafletMap geojsonData={geojsonData} onFeatureClick={handleFeatureClick} />
          ) : (
            <>
              {currentLayer === "station" && <StationTable />}
              {/* Các bảng khác nếu cần */}
            </>
          )}
        </div>
      </div>

      <FilterSidebar />
    </div>
  );
}
