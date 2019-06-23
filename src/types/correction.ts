export interface ArtistNameCorrection {
  [name: string]: string;
}

export interface AreaCorrection {
  [city: string]: string;
}

export interface ArtistAreaCorrection {
  [artist: string]: string;
}

export interface ParsedCorrections {
  artistNameCorrection: ArtistNameCorrection;
  artistAreaCorrection: ArtistAreaCorrection;
  areaCorrection: AreaCorrection;
}

export type AnyParsedCorrection = ArtistNameCorrection | AreaCorrection | ArtistAreaCorrection;
export type ParsedCorrectionsList = [ArtistNameCorrection, AreaCorrection, ArtistAreaCorrection];
