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
