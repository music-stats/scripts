export interface AreaGeoJson {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: Record<string, unknown>;
}

export interface WorldGeoJson {
  type: 'FeatureCollection';
  features: AreaGeoJson[];
}
