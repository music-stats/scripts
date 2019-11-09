export interface AreaGeoJson {
  type: 'Feature';
  properties: {
    [key: string]: any;
  };
  geometry: {};
}

export interface WorldGeoJson {
  type: 'FeatureCollection';
  features: AreaGeoJson[];
}
