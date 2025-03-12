export interface GeoJsonData {
    type: "FeatureCollection";
    features: Feature[];
}
  
export interface Feature {
    type: "Feature";
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    properties: FeatureProperties;
}
  
export interface FeatureProperties {
    name?: string;
    continent?: string;
    region?: string;
    size?: number;
    country?: string;
}
  