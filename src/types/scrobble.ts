interface Item {
  name: string;
  playcount: number;
  mbid: string; // e.g. "0a2da65c-dcff-3837-beb7-0dc1697870ee"
}

export interface Scrobble {
  date: string; // e.g. "26 Feb 2019, 18:13"
  track: Item;
  album: Item;
  artist: Item;
}
