export interface Artist {
  name: string;
  playcount: number;
  mbid: string; // MusicBrainz id
}

export interface ArtistArea {
  artist: string;
  area: string;
}

export interface MergedArtist {
  name: string;
  playcount: number;
  area: string;
}

// [name, playcount, countryCode]
export type PackedArtist = [string, number, string];
