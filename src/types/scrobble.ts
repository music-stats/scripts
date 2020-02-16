interface Item {
  name: string;
  playcount: number;
}

export interface Scrobble {
  date: string; // e.g. "26 Feb 2019, 18:13"
  track: Item;
  album: Item;
  artist: Item;
}

export type ScrobbleList = Scrobble[];

export type CompressedScrobble = [
  string, // date
  string, // track name
  number, // track playcount
  string, // album name
  number, // album playcount
  string, // artist name
  number, // artist playcount
];

export type CompressedScrobbleList = CompressedScrobble[];
