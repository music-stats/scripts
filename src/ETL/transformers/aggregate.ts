import {Scrobble} from 'src/types/scrobble';

export function aggregatePlaycounts(scrobbleList: Scrobble[]): Scrobble[] {
  const accumulator: {[key: string]: number} = {};
  const updatePlaycountValues = (scrobble: Scrobble): Scrobble => {
    const {track, album, artist} = scrobble;
    const trackKey = `${artist.name} - ${track.name}`;
    const albumKey = `${artist.name} - ${album.name}`;
    const artistKey = artist.name;

    [trackKey, albumKey, artistKey].forEach((key) => {
      accumulator[key] = accumulator[key]
        ? accumulator[key] + 1
        : 1;
    });

    return {
      ...scrobble,
      track: {
        ...track,
        playcount: accumulator[trackKey],
      },
      album: {
        ...album,
        playcount: accumulator[albumKey],
      },
      artist: {
        ...artist,
        playcount: accumulator[artistKey],
      },
    };
  };

  // "scrobbleList" contains scrobbles in reversed chronological order
  return [...scrobbleList]
    .reverse()
    .map(updatePlaycountValues)
    .reverse();
}
