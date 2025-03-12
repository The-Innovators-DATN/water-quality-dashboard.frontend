"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GeoJsonData } from "@/lib/types/geojsonDataType";
import LayerSelector from "@/components/ui/LayerSelector";
import ListView from "@/components/list/ListView"; 
import MapView from "@/components/map/MapView";
import WaterQualityDialog, { StationData, WeatherData, MeasurementRecord } from "@/components/map/WaterQualityDialog";

interface FeatureProperties {
    name?: string;
    continent?: string;
    region?: string;
    size?: number;
    country?: string;
    id?: string;
    coordinates?: string;
}

function HomeContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "map";

    const [currentLayer, setCurrentLayer] = useState<string>("");
    const [geojsonData, setGeojsonData] = useState<GeoJsonData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<FeatureProperties | null>(null);
    const [stationData, setStationData] = useState<StationData | undefined>(undefined);
    const [weatherData, setWeatherData] = useState<WeatherData | undefined>(undefined);
    const [measurementData, setMeasurementData] = useState<MeasurementRecord[] | undefined>(undefined);

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
            const response = await fetch(`/api/geojson?layer=${layer}`);
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

    useEffect(() => {
        const fetchStationData = async () => {
            if (!selectedFeature) return;
            
            const newStationData: StationData = {
                id: selectedFeature.id || `Station-${Math.floor(Math.random() * 1000)}`,
                name: selectedFeature.name || "Trạm quan trắc",
                coordinates: selectedFeature.coordinates || "45.123/25.456",
                area: selectedFeature.region || "Chưa Âu",
                country: selectedFeature.country || "Việt Nam",
                basin: "DANUBE",
                wqi: Math.floor(Math.random() * 100)
            };
            
            setStationData(newStationData);
            
            setWeatherData({
                temperature: `${Math.floor(20 + Math.random() * 15)}°C`,
                condition: "Trời nhiều mây",
                elapsedTime: Math.floor(Math.random() * 86400)
            });
            
            const mockMeasurements: MeasurementRecord[] = Array(5).fill(null).map((_, index) => ({
                timestamp: new Date(Date.now() - index * 3600000).toISOString().replace('T', ' ').substring(0, 19),
                user: "abcxyz",
                station: newStationData.name,
                message: `Chỉ số pH tại trạm ${newStationData.name} đã vượt mức 10`,
                level: Math.random() > 0.5 ? "Cao" : "Trung bình"
            }));
            
            setMeasurementData(mockMeasurements);
        };
        
        fetchStationData();
    }, [selectedFeature]);

    const handleFeatureClick = (feature: FeatureProperties) => {
        setSelectedFeature(feature);
        setDialogOpen(true);
    };

    return (
        <div className="relative w-full h-full flex flex-col">
            <LayerSelector currentLayer={currentLayer} onLayerChange={setCurrentLayer} />
            {type === "map" ? (
                <MapView 
                    geojsonData={geojsonData} 
                    onFeatureClick={handleFeatureClick}
                    isLoading={isLoading} 
                />
            ) : (
                <ListView />
            )}
            
            <WaterQualityDialog 
                isOpen={dialogOpen} 
                onOpenChange={setDialogOpen}
                stationData={stationData}
                weatherData={weatherData}
                measurementData={measurementData}
            />
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full">Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}
