interface PaginationMetadata {
  user: string;
  page: string;
  perPage: string;
  totalPages: string;
  total: string;
}

// @see: https://www.last.fm/api/show/library.getArtists
export interface LibraryResponseData {
  artists: {
    artist: Artist[];
    '@attr': PaginationMetadata;
  };
}

// @see: https://www.last.fm/api/show/user.getRecentTracks
export interface RecentTracksResponseData {
  recentTracks: {
    track: RecentTrack[];
    '@attr': PaginationMetadata;
  };
}

export interface Artist {
  name: string;
  playcount: string;
  tagcount: string;
  mbid: string;
  url: string;
  streamable: string;
  image: ArtistImage[];
}

interface ArtistImage {
  '#text': string;
  size: ArtistImageSize;
}

type ArtistImageSize =
  'small' |
  'medium' |
  'large' |
  'extralarge' |
  'mega';

export interface RecentTrack {
  name: string;
  mbid: string;
  date: {
    uts: string; // e.g. "1551204811"
    '#text': string; // e.g. "26 Feb 2019, 18:13"
  };
  album: {
    mbid: string;
    '#text': string;
  };
  artist: {
    mbid: string;
    '#text': string;
  };
}
