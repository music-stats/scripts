import {Scrobble, ScrobbleList} from 'src/types/scrobble';

// expects "scrobbleList" to contains scrobbles in chronological order
export function aggregatePlaycounts(scrobbleList: ScrobbleList): ScrobbleList {
  const accumulator: {[key: string]: number} = {};
  const updatePlaycountValues = (scrobble: Scrobble): Scrobble => {
    const {track, album, artist} = scrobble;

    // prefixes are added to avoid collisions,
    // e.g. same track and album names for the same artist
    const trackKey = `track: ${artist.name} - ${track.name}`;
    const albumKey = `album: ${artist.name} - ${album.name}`;
    const artistKey = `artist: ${artist.name}`;

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

  return scrobbleList.map(updatePlaycountValues);
}
