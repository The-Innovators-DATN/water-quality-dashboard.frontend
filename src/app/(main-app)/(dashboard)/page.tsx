"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GeoJsonData } from "@/lib/types/geojsonDataType";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
    const [currentLayer, setCurrentLayer] = useState<string>("");
    const [geojsonData, setGeojsonData] = useState<GeoJsonData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!currentLayer) {
            setGeojsonData(null);
            return;
        }

        setIsLoading(true);

        fetch(`/api/geojson?layer=${currentLayer}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch GeoJSON");
                }
                return response.json();
            })
            .then((data) => {
                setGeojsonData(data);
            })
            .catch((error) => {
                console.error(`Error loading GeoJSON (${currentLayer}):`, error);
                setGeojsonData(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentLayer]);

    const handleLayerChange = (layer: string) => {
        setCurrentLayer(layer);
    };

    return (
        <div className="w-full">
            <div className="h-[10%] bg-white p-2 shadow flex justify-between items-center">
                <div className="flex">
                    <button className="px-3 py-1 bg-gray-200">Bản đồ</button>
                    <button className="px-3 py-1 bg-gray-200">Danh sách</button>
                </div>
                <div className="flex">
                    <button
                        className={`px-3 py-1 ${currentLayer === "" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => handleLayerChange("")}
                    >
                        Trạm
                    </button>
                    <button
                        className={`px-3 py-1 ${currentLayer === "catchments" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => handleLayerChange("catchments")}
                    >
                        Lưu vực
                    </button>
                    <button
                        className={`px-3 py-1 ${currentLayer === "countries" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => handleLayerChange("countries")}
                    >
                        Quốc gia
                    </button>
                </div>
            </div>
            {!isLoading && (
                <Map key={`${currentLayer}-${isLoading}`} geojsonData={geojsonData} currentLayer={currentLayer} />
            )}
        </div>
    );
}
