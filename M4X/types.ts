export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  id: number;
  city: string;
  country: string;
  coordinates: Coordinates;
  geoJsonName: string; // Helper to match TopoJSON properties
  circuit: string;
  date: string;
  qualifyingResult: string;
  raceResult: string;
}

export interface WorldAtlasData {
  type: string;
  objects: {
    countries: {
      type: string;
      geometries: Array<{
        type: string;
        id: string | number;
        properties: {
          name: string;
        };
      }>;
    };
  };
}