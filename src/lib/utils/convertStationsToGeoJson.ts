import { GeoJsonData } from "@/lib/types/geojsonDataType";

export function convertStationsToGeoJson(stations: any[]): GeoJsonData {
  return {
    type: "FeatureCollection",
    features: stations.map((station) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [station.long, station.lat],
      },
      properties: {
        id: station.id?.toString(),
        name: station.name,
        description: station.description,
        country: station.country,
        status: station.status,
      },
    })),
  };
}
