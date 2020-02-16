import {Scrobble, CompressedScrobble} from 'src/types/scrobble';

export function compress({date, track, album, artist}: Scrobble): CompressedScrobble {
  return [
    date,
    track.name,
    track.playcount,
    album.name,
    album.playcount,
    artist.name,
    artist.playcount,
  ];
}

export function uncompress([
  date,
  trackName,
  trackPlaycount,
  albumName,
  albumPlaycount,
  artistName,
  artistPlaycount,
]: CompressedScrobble): Scrobble {
  return {
    date,
    track: {
      name: trackName,
      playcount: trackPlaycount,
    },
    album: {
      name: albumName,
      playcount: albumPlaycount,
    },
    artist: {
      name: artistName,
      playcount: artistPlaycount,
    },
  };
}
