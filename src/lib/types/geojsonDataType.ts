export interface GeoJsonFeature {
    type: "Feature";
    name: string;
    feature: [
        type: string,
        geometry: {
            type: string;
            coordinates: number[][] | number[][][] | number[][][][];
        }
    ]
}
  
export interface GeoJsonData {
    type: "FeatureCollection";
    features: GeoJsonFeature[];
}